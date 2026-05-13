import { getPendingPayments, getPaymentHistory, getPaymentStats } from "@/lib/actions/payments";
import PaymentCard from "./PaymentCard";
import PaymentHistoryTable from "./PaymentHistoryTable";
import { Clock, CheckCircle2, XCircle, DollarSign } from "lucide-react";

const HISTORY_PAGE_SIZE = 10;

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const histPage = Math.max(1, parseInt(pageParam ?? "1", 10));

  const [pendingResult, historyResult, stats] = await Promise.all([
    getPendingPayments(),
    getPaymentHistory(histPage, HISTORY_PAGE_SIZE),
    getPaymentStats(),
  ]);

  const inscriptions = pendingResult.inscriptions ?? [];
  const history = historyResult.inscriptions ?? [];
  const historyTotal = historyResult.total ?? 0;
  const historyPages = historyResult.pages ?? 0;

  const statCards = [
    {
      icon: Clock,
      value: stats.pending,
      label: "Pendientes",
      bgClass: "bg-orange-50 dark:bg-orange-950/20",
      textClass: "text-orange-500",
    },
    {
      icon: CheckCircle2,
      value: stats.approved,
      label: "Aprobados",
      bgClass: "bg-green-50 dark:bg-green-950/20",
      textClass: "text-green-500",
    },
    {
      icon: XCircle,
      value: stats.rejected,
      label: "Rechazados",
      bgClass: "bg-red-50 dark:bg-red-950/20",
      textClass: "text-red-500",
    },
    {
      icon: DollarSign,
      value: `$${stats.totalApprovedAmount.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}`,
      label: "Total Recaudado",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
      textClass: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, value, label, bgClass, textClass }) => (
          <div
            key={label}
            className="bg-card p-5 sm:p-6 rounded-xl border border-card-border shadow-sm flex items-center gap-4"
          >
            <div className={`p-3.5 ${bgClass} ${textClass} rounded-xl shrink-0`}>
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-2xl sm:text-3xl font-black text-foreground leading-none truncate">
                {value}
              </p>
              <p className="text-xs sm:text-sm text-muted font-bold mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-black text-foreground">Pagos Pendientes</h2>
          {inscriptions.length > 0 && (
            <span className="bg-orange-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
              {inscriptions.length}
            </span>
          )}
        </div>

        {inscriptions.length === 0 ? (
          <div className="bg-card rounded-xl p-12 text-center border border-card-border shadow-sm flex flex-col items-center">
            <div className="w-14 h-14 bg-green-50 dark:bg-green-950/20 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle2 className="text-green-500" size={28} />
            </div>
            <h3 className="text-base font-bold text-foreground">Todo al día</h3>
            <p className="text-muted text-sm mt-1">No hay pagos pendientes por validar.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {inscriptions.map((inscription) => (
              <PaymentCard key={inscription.id} inscription={inscription} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-black text-foreground">Historial de Pagos</h2>
          {historyTotal > 0 && (
            <span className="text-sm text-muted font-bold">{historyTotal} registros</span>
          )}
        </div>

        <PaymentHistoryTable
          inscriptions={history}
          total={historyTotal}
          page={histPage}
          pages={historyPages}
          pageSize={HISTORY_PAGE_SIZE}
        />
      </section>
    </div>
  );
}
