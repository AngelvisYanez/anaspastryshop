import Link from "next/link";
import {
  Users, Clock, TrendingUp, TrendingDown, Wallet,
} from "lucide-react";
import { AdminRevenueChart } from "@/app/dashboard/charts/AdminCharts";

export type AdminDashboardStats = {
  userGrowth: number;
  revenueGrowth: number;
  totalRevenue: number;
  registrationsByDay: { date: string; revenue: number }[];
  revenueByDay: { date: string; revenue: number }[];
  paymentMethodsData: { name: string; value: number }[];
  pendingPayments: number;
  totalUsers: number;
};

export type RecentInscription = {
  id: string;
  amountPaid: number;
  method: string;
  status: string;
  createdAt: Date;
  user: { name: string | null; email: string } | null;
  curso: { title: string } | null;
};

export function AdminDashboardHome({
  adminStats,
  lastInscriptions,
}: {
  adminStats: AdminDashboardStats;
  lastInscriptions: RecentInscription[];
}) {
  return (
    <>
      <div className="space-y-4 sm:space-y-6">
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

            <Link href="/dashboard/pagos" className="bg-card p-4 sm:p-6 rounded-2xl border border-card-border shadow-sm hover:shadow-md hover:border-accent/30 transition sm:col-span-2 lg:col-span-1">
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
                <AdminRevenueChart data={adminStats.revenueByDay} />
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
                <AdminRevenueChart data={adminStats.registrationsByDay} />
              </div>
            </div>
          </div>
      {/* Recent inscriptions table */}

        <div className="bg-card rounded-2xl border border-card-border overflow-hidden shadow-sm">
          <div className="p-4 sm:p-6 border-b border-card-border flex justify-between items-center">
            <div>
              <h3 className="font-black text-foreground text-sm sm:text-base">Últimas Inscripciones & Pagos</h3>
              <p className="text-xs text-muted font-medium">Alumnos inscritos recientemente a formaciones</p>
            </div>
            <Link href="/dashboard/pagos" className="text-xs font-bold text-accent hover:underline">
              Ver todos →
            </Link>
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
      </div>
    </>
  );
}
