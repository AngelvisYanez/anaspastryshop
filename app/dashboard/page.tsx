import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Users, CreditCard, Clock, CheckCircle2, AlertCircle,
  PlayCircle, BookOpen, Star, TrendingUp, TrendingDown,
  Wallet, ArrowRight, Video, Sparkles, MapPin, Calendar, Tag,
} from "lucide-react";
import RevenueChart from "@/app/dashboard/charts/RevenueChart";
import { parseWorkshopDetails } from "@/lib/utils/workshop";

export const metadata = {
  title: "Dashboard | Ana's Pastry Shop",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const role = session.user.role;

  // For USER, fetch their individual purchases and approved inscriptions
  let userCourses: any[] = [];
  let pendingInscription = false;

  if (role === "USER") {
    const [purchases, inscriptions, pendingCount] = await Promise.all([
      prisma.coursePurchase.findMany({
        where: { userId: session.user.id, status: "COMPLETED" },
        include: {
          curso: {
            include: {
              instructor: { select: { name: true } },
              _count: { select: { courseModules: true } },
            },
          },
        },
      }),
      prisma.inscription.findMany({
        where: { userId: session.user.id, status: "APPROVED", NOT: { cursoId: null } },
        include: {
          curso: {
            include: {
              instructor: { select: { name: true } },
              _count: { select: { courseModules: true } },
            },
          },
        },
      }),
      prisma.inscription.count({
        where: { userId: session.user.id, status: "PENDING" },
      }),
    ]);

    const courseMap = new Map<string, any>();
    for (const p of purchases) {
      if (p.curso) courseMap.set(p.cursoId, p.curso);
    }
    for (const i of inscriptions) {
      if (i.curso && i.cursoId) courseMap.set(i.cursoId, i.curso);
    }
    userCourses = Array.from(courseMap.values());
    pendingInscription = pendingCount > 0;
  }

  // Admin stats calculation
  let adminStats = null;
  if (role === "ADMIN") {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      recentInscriptions,
      recentUsers,
      currentRevenue,
      previousRevenue,
      currentUsersCount,
      previousUsersCount,
      totalRevenue,
      methods,
    ] = await Promise.all([
      prisma.inscription.findMany({
        where: { createdAt: { gte: fourteenDaysAgo }, status: "APPROVED" },
        select: { createdAt: true, amountPaid: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: fourteenDaysAgo } },
        select: { createdAt: true },
      }),
      prisma.inscription.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo }, status: "APPROVED" },
        _sum: { amountPaid: true },
      }),
      prisma.inscription.aggregate({
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, status: "APPROVED" },
        _sum: { amountPaid: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.inscription.aggregate({
        where: { status: "APPROVED" },
        _sum: { amountPaid: true },
      }),
      prisma.inscription.groupBy({
        by: ["method"],
        where: { status: "APPROVED" },
        _sum: { amountPaid: true },
      }),
    ]);

    const daysMap = new Map<string, { date: string; amount: number; count: number; users: number }>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
      daysMap.set(key, { date: key, amount: 0, count: 0, users: 0 });
    }

    recentInscriptions.forEach((item) => {
      const key = new Date(item.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
      if (daysMap.has(key)) {
        const current = daysMap.get(key)!;
        current.amount += item.amountPaid;
        current.count += 1;
      }
    });

    recentUsers.forEach((item) => {
      const key = new Date(item.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
      if (daysMap.has(key)) {
        const current = daysMap.get(key)!;
        current.users += 1;
      }
    });

    const revenueByDay = Array.from(daysMap.values()).map((d) => ({
      date: d.date,
      revenue: d.amount,
    }));

    const registrationsByDay = Array.from(daysMap.values()).map((d) => ({
      date: d.date,
      revenue: d.users,
    }));

    const paymentMethodsData = methods.map((m) => ({
      name: m.method || "Otro",
      value: m._sum.amountPaid || 0,
    }));

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    adminStats = {
      userGrowth: calculateGrowth(currentUsersCount, previousUsersCount),
      revenueGrowth: calculateGrowth(currentRevenue._sum.amountPaid || 0, previousRevenue._sum.amountPaid || 0),
      totalRevenue: totalRevenue._sum.amountPaid || 0,
      registrationsByDay,
      revenueByDay,
      paymentMethodsData,
      pendingPayments: await prisma.inscription.count({ where: { status: "PENDING" } }),
      totalUsers: await prisma.user.count(),
    };
  }

  const lastInscriptions = await prisma.inscription.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      curso: { select: { title: true } },
    },
  });

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
          Hola, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-muted font-medium mt-0.5 sm:mt-1 text-sm sm:text-base">
          {role === "ADMIN"
            ? "Explora el rendimiento de tu tienda y gestiona los cursos y workshops."
            : "Bienvenido a tu espacio de formación. Cursos online y workshops individuales con acceso permanente."}
        </p>
      </div>

      {role === "USER" && (
        <div className="space-y-6 sm:space-y-8">
          {/* Promo Card: Bundle de Cursos Online con Cupón */}
          <div className="bg-gradient-to-br from-brand-purple via-brand-purple-deep to-brand-purple-deep border-2 border-accent/30 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 bg-accent text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                  <Tag size={12} /> Cupón de Promoción Especial
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Compra todos los Cursos Online con Descuento
                </h2>
                <p className="text-sm text-white/80 leading-relaxed font-medium">
                  Aplica el cupón <strong className="text-pink-300 bg-white/10 px-2 py-0.5 rounded font-mono text-base">TODOSLOSCURSOS</strong> al pagar y obtén 40% de descuento en todas las formaciones online.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <Link
                  href="/cursos?tipo=online"
                  className="bg-accent text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-accent-hover transition-colors text-center shadow-lg"
                >
                  Ver Cursos Online
                </Link>
                <Link
                  href="/cursos?tipo=presencial"
                  className="bg-white/10 text-white border border-white/20 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors text-center"
                >
                  Workshops Presenciales
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Payment Notification */}
          {pendingInscription && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-0.5">
                  Pago en Proceso de Verificación
                </p>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                  Tu comprobante está siendo revisado por nuestro equipo de administración. Recibirás un correo en cuanto se habilite tu acceso al curso o taller.
                </p>
              </div>
            </div>
          )}

          {/* User's Courses and Workshops */}
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-accent mb-0.5">
                  Tus Formaciones Adquiridas
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Mis Cursos & Workshops Activos
                </h2>
              </div>
              <Link href="/cursos" className="shrink-0">
                <span className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  Explorar Más <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            {userCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {userCourses.map((curso) => {
                  const workshopInfo = parseWorkshopDetails(curso.content, curso.isLive, curso.title);
                  const isWorkshop = workshopInfo.isWorkshop;

                  return (
                    <Link
                      key={curso.id}
                      href={`/dashboard/cursos/${curso.id}`}
                      className="group bg-card border border-card-border hover:border-accent/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="relative h-44 bg-section-alt overflow-hidden">
                        {curso.image ? (
                          <Image
                            src={curso.image}
                            alt={curso.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-accent-subtle">
                            <PlayCircle size={40} className="text-accent/60" />
                          </div>
                        )}
                        <span className={`absolute top-3 left-3 text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md ${
                          isWorkshop
                            ? "bg-accent text-white"
                            : "bg-purple-900/90 text-pink-200 border border-pink-500/30"
                        }`}>
                          {isWorkshop ? "Workshop Presencial" : "Curso Online"}
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="font-bold text-foreground text-base line-clamp-1 group-hover:text-accent transition-colors">
                            {curso.title}
                          </h3>
                          <p className="text-xs text-muted line-clamp-2 mt-1">
                            {curso.description}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-card-border/60">
                          {isWorkshop ? (
                            <div className="space-y-1 text-xs text-muted font-medium">
                              <p className="flex items-center gap-1.5 text-foreground">
                                <MapPin size={12} className="text-accent shrink-0" />
                                <span className="truncate">{workshopInfo.location}</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-accent shrink-0" />
                                <span>{workshopInfo.workshopDate}</span>
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs text-muted">
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="text-accent" />
                                {curso.totalHours}h
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen size={12} className="text-accent" />
                                {curso._count?.courseModules || 0} módulos cargados
                              </span>
                            </div>
                          )}

                          <div className="mt-auto pt-2 border-t border-card-border flex items-center justify-between">
                            <span className="text-xs font-bold text-accent group-hover:underline flex items-center gap-1">
                              {isWorkshop ? "Ver Detalles Presenciales" : "Ver Todos los Módulos"} →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card border border-card-border rounded-2xl p-10 text-center max-w-xl mx-auto shadow-sm">
                <BookOpen size={40} className="mx-auto text-accent/40 mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">
                  Aún no tienes formaciones activas
                </h3>
                <p className="text-xs text-muted font-medium mb-6">
                  Elige entre nuestros cursos online interactivos por módulos o reserva tu cupo para los talleres presenciales.
                </p>
                <Link
                  href="/cursos"
                  className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent-hover transition-colors shadow-md"
                >
                  Explorar Catálogo
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {role === "ADMIN" && adminStats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-card p-4 sm:p-6 rounded-2xl border border-card-border shadow-sm">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-accent-subtle text-accent rounded-xl"><Wallet size={16} /></div>
                <div className={`flex items-center gap-1 text-[9px] sm:text-[11px] font-black px-1.5 sm:px-2 py-1 rounded-lg ${adminStats.revenueGrowth >= 0 ? "text-green-600 bg-green-50 dark:bg-green-950/30" : "text-red-600 bg-red-50 dark:bg-red-950/30"}`}>
                  {adminStats.revenueGrowth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(adminStats.revenueGrowth)}%
                </div>
              </div>
              <p className="text-[9px] sm:text-[11px] font-bold uppercase text-muted/60 tracking-widest mb-1">Ingresos Totales</p>
              <p className="font-display text-2xl sm:text-3xl font-black text-foreground italic">${adminStats.totalRevenue}</p>
              <p className="text-[9px] sm:text-[11px] text-muted font-bold mt-1.5 sm:mt-2">Pagos individuales validados</p>
            </div>

            <div className="bg-card p-4 sm:p-6 rounded-2xl border border-card-border shadow-sm">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-accent-subtle text-accent rounded-xl"><Users size={16} /></div>
                <div className={`flex items-center gap-1 text-[9px] sm:text-[11px] font-black px-1.5 sm:px-2 py-1 rounded-lg ${adminStats.userGrowth >= 0 ? "text-green-600 bg-green-50 dark:bg-green-950/30" : "text-red-600 bg-red-50 dark:bg-red-950/30"}`}>
                  {adminStats.userGrowth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(adminStats.userGrowth)}%
                </div>
              </div>
              <p className="text-[9px] sm:text-[11px] font-bold uppercase text-muted/60 tracking-widest mb-1">Alumnos Registrados</p>
              <p className="font-display text-2xl sm:text-3xl font-black text-foreground italic">{adminStats.totalUsers}</p>
              <p className="text-[9px] sm:text-[11px] text-muted font-bold mt-1.5 sm:mt-2">Comunidad de pastelería</p>
            </div>

            <Link href="/dashboard/pagos" className="bg-card p-4 sm:p-6 rounded-2xl border border-card-border shadow-sm hover:shadow-md hover:border-accent/30 transition-all sm:col-span-2 lg:col-span-1">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-xl"><Clock size={16} /></div>
                <span className="text-[9px] sm:text-[11px] font-black uppercase text-muted/60 tracking-widest">Validación</span>
              </div>
              <p className="text-[9px] sm:text-[11px] font-bold uppercase text-muted/60 tracking-widest mb-1">Pagos Pendientes</p>
              <p className="font-display text-2xl sm:text-3xl font-black text-foreground italic">{adminStats.pendingPayments}</p>
              <p className="text-[9px] sm:text-[11px] text-muted font-bold mt-1.5 sm:mt-2">Por verificar en administración</p>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-card p-4 sm:p-6 md:p-8 rounded-2xl border border-card-border shadow-sm">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-foreground">Resumen de Ingresos</h3>
                  <p className="text-[11px] sm:text-xs text-muted font-bold">Últimos 14 días</p>
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px]">
                <RevenueChart data={adminStats.revenueByDay} />
              </div>
            </div>

            <div className="bg-card p-4 sm:p-6 md:p-8 rounded-2xl border border-card-border shadow-sm">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-foreground">Crecimiento de Alumnos</h3>
                  <p className="text-[11px] sm:text-xs text-muted font-bold">Nuevos registros diarios</p>
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px]">
                <RevenueChart data={adminStats.registrationsByDay} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recent inscriptions table */}
      {role === "ADMIN" && (
        <div className="bg-card rounded-2xl border border-card-border overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-card-border flex justify-between items-center">
            <div>
              <h3 className="font-black text-foreground text-sm sm:text-base">Últimas Inscripciones & Pagos</h3>
              <p className="text-xs text-muted font-medium">Alumnos inscritos recientemente a formaciones</p>
            </div>
            {role === "ADMIN" && (
              <Link href="/dashboard/pagos" className="text-xs font-bold text-accent hover:underline">
                Ver todos →
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-section-alt text-muted uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-4 sm:px-6 py-3">Alumno</th>
                  <th className="px-4 sm:px-6 py-3">Formación</th>
                  <th className="px-4 sm:px-6 py-3">Monto</th>
                  <th className="px-4 sm:px-6 py-3">Método</th>
                  <th className="px-4 sm:px-6 py-3">Estado</th>
                  <th className="px-4 sm:px-6 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {lastInscriptions.length > 0 ? (
                  lastInscriptions.map((insc) => (
                    <tr key={insc.id} className="hover:bg-section-alt/50 transition-colors">
                      <td className="px-4 sm:px-6 py-3.5 font-bold text-foreground">
                        {insc.user?.name || "Usuario"}
                        <span className="block text-[11px] text-muted font-normal">{insc.user?.email}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-foreground font-medium truncate max-w-[150px]">
                        {insc.curso?.title || "Formación General"}
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 font-mono font-bold text-foreground">
                        ${insc.amountPaid} USD
                      </td>
                      <td className="px-4 sm:px-6 py-3.5">
                        <span className="font-bold text-muted">{insc.method}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            insc.status === "APPROVED"
                              ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                              : insc.status === "PENDING"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                              : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                          }`}
                        >
                          {insc.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3.5 text-muted">
                        {new Date(insc.createdAt).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                      No hay registros de inscripciones todavía.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
