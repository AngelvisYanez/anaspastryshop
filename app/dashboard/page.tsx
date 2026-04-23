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
} from "lucide-react";
import Link from "next/link";
import { subDays, startOfDay, endOfDay, format } from "date-fns";
import { es } from "date-fns/locale";
import GrowthChart from "./charts/GrowthChart";
import RevenueChart from "./charts/RevenueChart";
import PaymentMethodsChart from "./charts/PaymentMethodsChart";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;
  const role = session.user.role;

  // --- LÓGICA DE DATOS AVANZADA (Solo para ADMIN) ---
  let adminStats = null;

  if (role === "ADMIN") {
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    // 1. Usuarios e Ingresos (Periodo Actual vs Anterior)
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

    // 2. Datos para Gráficas (Últimos 7 días para ejemplo visual claro, o 14)
    const last14Days = Array.from({ length: 14 }, (_, i) => subDays(now, i)).reverse();
    
    const registrationsByDay = await Promise.all(
      last14Days.map(async (day) => {
        const count = await prisma.user.count({
          where: { createdAt: { gte: startOfDay(day), lte: endOfDay(day) } },
        });
        return { date: format(day, "dd MMM", { locale: es }), count };
      })
    );

    const revenueByDay = await Promise.all(
      last14Days.map(async (day) => {
        const result = await prisma.inscription.aggregate({
          where: { status: "APPROVED", createdAt: { gte: startOfDay(day), lte: endOfDay(day) } },
          _sum: { amountPaid: true },
        });
        return { date: format(day, "dd MMM", { locale: es }), revenue: result._sum.amountPaid || 0 };
      })
    );

    // 3. Distribución por Métodos de Pago
    const methods = await prisma.inscription.groupBy({
      by: ["method"],
      where: { status: "APPROVED" },
      _sum: { amountPaid: true },
    });

    const paymentMethodsData = methods.map((m) => ({
      name: m.method,
      value: m._sum.amountPaid || 0,
    }));

    // Cálculos de Crecimiento
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
    <div className="space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black text-[#0B1F3A] tracking-tighter">
          Hola, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-400 font-medium">
          {role === "ADMIN"
            ? "Explora el rendimiento de tu academia en tiempo real."
            : "Gestiona tu contenido y revisa el progreso de tus alumnos."}
        </p>
      </div>

      {role === "ADMIN" && adminStats && (
        <>
          {/* KPI CARDS (ADMIN) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Balance */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-amber-50 text-[#C9A84C] rounded-2xl"><Wallet size={20} /></div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${adminStats.revenueGrowth >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                  {adminStats.revenueGrowth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(adminStats.revenueGrowth)}%
                </div>
              </div>
              <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-1">Balance Total</p>
              <p className="text-3xl font-black text-[#0B1F3A] italic">${adminStats.totalRevenue}</p>
              <p className="text-[10px] text-gray-400 font-bold mt-2">v.s. mes anterior</p>
            </div>

            {/* Alumnos Totales */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Users size={20} /></div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${adminStats.userGrowth >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}`}>
                  {adminStats.userGrowth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {Math.abs(adminStats.userGrowth)}%
                </div>
              </div>
              <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-1">Alumnos Totales</p>
              <p className="text-3xl font-black text-[#0B1F3A]">{adminStats.totalUsers}</p>
              <p className="text-[10px] text-gray-400 font-bold mt-2">v.s. mes anterior</p>
            </div>

            {/* Pagos Pendientes */}
            <Link href="/dashboard/pagos" className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl"><Clock size={20} /></div>
                <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Pendientes</span>
              </div>
              <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest mb-1">Validaciones</p>
              <p className="text-3xl font-black text-[#0B1F3A]">{adminStats.pendingPayments}</p>
              <p className="text-[10px] text-gray-400 font-bold mt-2">Acción requerida</p>
            </Link>
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Balance Overview */}
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-black text-[#0B1F3A]">Resumen de Ingresos</h3>
                  <p className="text-xs text-gray-400 font-bold">Últimos 14 días</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-[#C9A84C]"></span> Este periodo
                </div>
              </div>
              <RevenueChart data={adminStats.revenueByDay} />
            </div>

            {/* Growth Overview */}
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-lg font-black text-[#0B1F3A]">Crecimiento de Alumnos</h3>
                  <p className="text-xs text-gray-400 font-bold">Nuevos registros diarios</p>
                </div>
              </div>
              <GrowthChart data={adminStats.registrationsByDay} />
            </div>

            {/* Payment Methods */}
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-[#0B1F3A] mb-2">Fuentes de Ingresos</h3>
              <p className="text-xs text-gray-400 font-bold mb-8">Desglose por método de pago</p>
              <PaymentMethodsChart data={adminStats.paymentMethodsData} />
            </div>

            {/* Últimas Inscripciones */}
            <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm overflow-hidden">
              <h3 className="text-lg font-black text-[#0B1F3A] mb-8 flex items-center gap-2">
                <AlertCircle size={20} className="text-[#C9A84C]" />
                Inscripciones Recientes
              </h3>
              <div className="space-y-6">
                {lastInscriptions.length > 0 ? lastInscriptions.map((ins) => (
                  <div key={ins.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-[#C9A84C] shadow-sm">
                        {ins.user?.name ? ins.user.name.substring(0, 2).toUpperCase() : "??"}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0B1F3A]">{ins.user?.name || ins.user?.email}</p>
                        <p className="text-[10px] text-gray-400 font-bold truncate max-w-[150px]">
                          {ins.curso?.title || "S/N"}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${
                      ins.status === "PENDING" ? "text-orange-500 bg-orange-50" : 
                      ins.status === "APPROVED" ? "text-green-500 bg-green-50" : "text-red-500 bg-red-50"
                    }`}>
                      {ins.status === "PENDING" ? "Pendiente" : ins.status === "APPROVED" ? "Aprobado" : "Rechazado"}
                    </span>
                  </div>
                )) : (
                  <p className="text-center text-gray-400 py-4 italic">Sin actividad reciente.</p>
                )}
                <Link href="/dashboard/pagos" className="block text-center text-xs font-black text-[#C9A84C] hover:underline mt-4">
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
