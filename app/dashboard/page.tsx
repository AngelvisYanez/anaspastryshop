import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Users,
  Wallet,
  BookOpen,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Star,
  PlayCircle,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { es } from "date-fns/locale";
import { AdminGrowthChart, AdminRevenueChart, AdminPaymentMethodsChart } from "./charts/AdminCharts";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;
  const role = session.user.role;

  let userSubscription = null;
  let userCourses: any[] = [];

  if (role === "USER") {
    [userSubscription, userCourses] = await Promise.all([
      prisma.subscription.findUnique({ where: { userId: session.user.id } }),
      prisma.curso.findMany({
        select: { id: true, title: true, image: true, level: true, totalHours: true, _count: { select: { courseModules: true } }, instructor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);
  }

  let adminStats = null;

  if (role === "ADMIN") {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    const currentUsersCount = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const previousUsersCount = await prisma.user.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    });

    const currentRevenue = await prisma.inscription.aggregate({
      where: { status: "APPROVED", createdAt: { gte: thirtyDaysAgo } },
      _sum: { amountPaid: true },
    });
    const previousRevenue = await prisma.inscription.aggregate({
      where: { status: "APPROVED", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
      _sum: { amountPaid: true },
    });

    const totalRevenue = await prisma.inscription.aggregate({
      where: { status: "APPROVED" },
      _sum: { amountPaid: true },
    });

    const last14Days = Array.from({ length: 14 }, (_, i) => subDays(now, i)).reverse();
    const rangeStart = startOfDay(last14Days[0]);
    const rangeEnd = endOfDay(now);

    const [usersLast14Days, inscriptionsLast14Days] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: rangeStart, lte: rangeEnd } },
        select: { createdAt: true },
      }),
      prisma.inscription.findMany({
        where: { status: "APPROVED", createdAt: { gte: rangeStart, lte: rangeEnd } },
        select: { createdAt: true, amountPaid: true },
      }),
    ]);

    const registrationsByDay = last14Days.map((day) => ({
      date: format(day, "dd MMM", { locale: es }),
      count: usersLast14Days.filter(
        (u) => u.createdAt >= startOfDay(day) && u.createdAt <= endOfDay(day)
      ).length,
    }));

    const revenueByDay = last14Days.map((day) => ({
      date: format(day, "dd MMM", { locale: es }),
      revenue: inscriptionsLast14Days
        .filter((i) => i.createdAt >= startOfDay(day) && i.createdAt <= endOfDay(day))
        .reduce((sum, i) => sum + (i.amountPaid || 0), 0),
    }));

    const methods = await prisma.inscription.groupBy({
      by: ["method"],
      where: { status: "APPROVED" },
      _sum: { amountPaid: true },
    });

    const paymentMethodsData = methods.map((m) => ({
      name: m.method,
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

  const isSubActive = userSubscription?.status === "ACTIVE";

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
          Hola, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-muted font-medium mt-0.5 sm:mt-1 text-sm sm:text-base">
          {role === "ADMIN"
            ? "Explora el rendimiento de tu academia en tiempo real."
            : role === "MENTOR"
            ? "Gestiona tu contenido y revisa el progreso de tus alumnos."
            : isSubActive
            ? "Tienes acceso completo a todos los cursos y sesiones."
            : "Activa tu membresía para acceder a todos los cursos."}
        </p>
      </div>

      {role === "USER" && (
        <div className="space-y-5 sm:space-y-8">
          {isSubActive ? (
            <div className="bg-card border border-card-border rounded-xl p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-green-100 dark:bg-green-950/30 rounded-lg flex items-center justify-center shrink-0">
                  <Star size={20} className="text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-500 mb-0.5">
                    Membresía Activa
                  </p>
                  <p className="font-black text-foreground text-base sm:text-lg">Acceso Completo</p>
                  <p className="text-xs sm:text-sm text-muted font-medium">Todos los cursos y sesiones en vivo desbloqueados</p>
                </div>
              </div>
              <Link href="/cursos" className="w-full sm:w-auto">
                <button className="bg-foreground text-background w-full sm:w-auto justify-center px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all whitespace-nowrap flex items-center gap-2 shrink-0">
                  Explorar Cursos <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-foreground rounded-xl p-5 sm:p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
              <div className="absolute top-[-20%] right-[-5%] w-64 h-64 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1.5">
                  Sin Membresía Activa
                </p>
                <p className="font-black text-background text-base sm:text-lg mb-0.5">Activa tu acceso completo</p>
                <p className="text-xs sm:text-sm text-background/60 font-medium">
                  Accede a todos los cursos, sesiones en vivo y material exclusivo.
                </p>
              </div>
              <Link href="/pagar/membresia" className="relative z-10 shrink-0 w-full sm:w-auto">
                <button className="bg-accent text-foreground w-full sm:w-auto justify-center px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all whitespace-nowrap flex items-center gap-2">
                  Activar Membresía <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          )}

          {isSubActive && (
            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-0.5">
                    Tu Biblioteca
                  </p>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter">Cursos disponibles</h2>
                </div>
                <Link href="/cursos" className="shrink-0">
                  <button className="text-sm font-bold text-accent hover:underline flex items-center gap-1">
                    Ver todos <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
              {userCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                  {userCourses.map((curso) => (
                    <Link key={curso.id} href={`/cursos/${curso.id}`}>
                      <div className="bg-card border border-card-border rounded-lg overflow-hidden hover:shadow-lg hover:border-accent/30 transition-all group">
                        {curso.image ? (
                          <div className="relative aspect-video sm:h-36 bg-section-alt overflow-hidden">
                            {curso.image.startsWith("data:") ? (
                              <img src={curso.image} alt={curso.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <Image src={curso.image} alt={curso.title} fill sizes="(max-width:640px) 100vw, 400px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                            )}
                          </div>
                        ) : (
                          <div className="aspect-video sm:h-36 bg-section-alt flex items-center justify-center">
                            <PlayCircle size={32} className="text-muted/40" />
                          </div>
                        )}
                        <div className="p-3 sm:p-4">
                          <span className="text-[10px] font-black uppercase tracking-widest bg-accent-subtle text-accent px-2 py-0.5 rounded-md">
                            {curso.level}
                          </span>
                          <h3 className="font-bold text-foreground mt-2 mb-1 leading-snug line-clamp-2 text-sm">{curso.title}</h3>
                          <p className="text-xs text-muted font-medium mb-3">{curso.instructor.name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted font-medium">
                            <span className="flex items-center gap-1"><Clock size={12} className="text-accent" />{curso.totalHours}h</span>
                            <span className="flex items-center gap-1"><BarChart2 size={12} className="text-accent" />{curso._count.courseModules} módulos</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-card-border rounded-lg p-12 text-center">
                  <BookOpen size={36} className="mx-auto text-muted/40 mb-3" />
                  <p className="text-muted font-medium">Aún no hay cursos publicados.</p>
                </div>
              )}
            </div>
          )}

          {userSubscription?.status === "PENDING" && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
              <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-bold text-amber-800 dark:text-amber-300 mb-0.5">Pago en revisión</p>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                  Tu pago está siendo verificado. Recibirás un email cuando tu membresía sea activada.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {role === "ADMIN" && adminStats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-card p-4 sm:p-6 rounded-lg border border-card-border shadow-sm">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-accent-subtle text-accent rounded-xl"><Wallet size={16} /></div>
                <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-1 rounded-lg ${adminStats.revenueGrowth >= 0 ? "text-green-600 bg-green-50 dark:bg-green-950/30" : "text-red-600 bg-red-50 dark:bg-red-950/30"}`}>
                  {adminStats.revenueGrowth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(adminStats.revenueGrowth)}%
                </div>
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase text-muted/60 tracking-widest mb-1">Balance Total</p>
              <p className="font-display text-2xl sm:text-3xl font-black text-foreground italic">${adminStats.totalRevenue}</p>
              <p className="text-[9px] sm:text-[10px] text-muted font-bold mt-1.5 sm:mt-2">v.s. mes anterior</p>
            </div>

            <div className="bg-card p-4 sm:p-6 rounded-lg border border-card-border shadow-sm">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-500 rounded-xl"><Users size={16} /></div>
                <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-1 rounded-lg ${adminStats.userGrowth >= 0 ? "text-green-600 bg-green-50 dark:bg-green-950/30" : "text-red-600 bg-red-50 dark:bg-red-950/30"}`}>
                  {adminStats.userGrowth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(adminStats.userGrowth)}%
                </div>
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase text-muted/60 tracking-widest mb-1">Alumnos Totales</p>
              <p className="font-display text-2xl sm:text-3xl font-black text-foreground italic">{adminStats.totalUsers}</p>
              <p className="text-[9px] sm:text-[10px] text-muted font-bold mt-1.5 sm:mt-2">v.s. mes anterior</p>
            </div>

            <Link href="/dashboard/pagos" className="bg-card p-4 sm:p-6 rounded-lg border border-card-border shadow-sm hover:shadow-md hover:border-accent/30 transition-all sm:col-span-2 lg:col-span-1">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-orange-50 dark:bg-orange-950/30 text-orange-500 rounded-xl"><Clock size={16} /></div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted/60 tracking-widest">Pendientes</span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase text-muted/60 tracking-widest mb-1">Validaciones</p>
              <p className="font-display text-2xl sm:text-3xl font-black text-foreground italic">{adminStats.pendingPayments}</p>
              <p className="text-[9px] sm:text-[10px] text-muted font-bold mt-1.5 sm:mt-2">Pendientes por revisar</p>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-card p-4 sm:p-6 md:p-8 rounded-xl border border-card-border shadow-sm">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-foreground">Resumen de Ingresos</h3>
                  <p className="text-[11px] sm:text-xs text-muted font-bold">Últimos 14 días</p>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold text-muted shrink-0">
                  <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-accent"></span> Este periodo
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px]">
                <AdminRevenueChart data={adminStats.revenueByDay} />
              </div>
            </div>

            <div className="bg-card p-4 sm:p-6 md:p-8 rounded-xl border border-card-border shadow-sm">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-foreground">Crecimiento de Alumnos</h3>
                  <p className="text-[11px] sm:text-xs text-muted font-bold">Nuevos registros diarios</p>
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px]">
                <AdminGrowthChart data={adminStats.registrationsByDay} />
              </div>
            </div>

            <div className="bg-card p-4 sm:p-6 md:p-8 rounded-xl border border-card-border shadow-sm">
              <h3 className="text-sm sm:text-base font-black text-foreground mb-0.5">Fuentes de Ingresos</h3>
              <p className="text-[11px] sm:text-xs text-muted font-bold mb-4 sm:mb-6">Desglose por método de pago</p>
              <div className="h-[250px] sm:h-[300px]">
                <AdminPaymentMethodsChart data={adminStats.paymentMethodsData} />
              </div>
            </div>

            <div className="bg-card rounded-xl p-4 sm:p-6 md:p-8 border border-card-border shadow-sm overflow-hidden">
              <h3 className="text-sm sm:text-base font-black text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                <AlertCircle size={16} className="text-accent" />
                Inscripciones Recientes
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {lastInscriptions.length > 0 ? lastInscriptions.map((ins) => (
                  <div key={ins.id} className="flex items-center justify-between p-2.5 sm:p-3 bg-section-alt/50 rounded-xl border border-transparent hover:border-card-border transition-all gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 sm:w-9 h-8 sm:h-9 bg-card rounded-lg flex items-center justify-center font-bold text-accent text-[10px] sm:text-xs shadow-sm border border-card-border shrink-0">
                        {ins.user?.name ? ins.user.name.substring(0, 2).toUpperCase() : "??"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-black text-foreground leading-none truncate">{ins.user?.name || ins.user?.email}</p>
                        <p className="text-[10px] text-muted font-bold truncate max-w-[120px] sm:max-w-[180px] mt-0.5">
                          {ins.curso?.title || "S/N"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[8px] sm:text-[9px] font-black px-1.5 sm:px-2 py-1 rounded-lg uppercase tracking-widest shrink-0 ${
                      ins.status === "PENDING" ? "text-orange-500 bg-orange-50 dark:bg-orange-950/30" :
                      ins.status === "APPROVED" ? "text-green-500 bg-green-50 dark:bg-green-950/30" : "text-red-500 bg-red-50 dark:bg-red-950/30"
                    }`}>
                      {ins.status === "PENDING" ? "Pendiente" : ins.status === "APPROVED" ? "Aprobado" : "Rechazado"}
                    </span>
                  </div>
                )) : (
                  <p className="text-center text-muted py-4 italic text-sm">Sin actividad reciente.</p>
                )}
                <Link href="/dashboard/pagos" className="block text-center text-xs font-black text-accent hover:underline pt-1 sm:pt-2">
                  Ver todas las transacciones
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
