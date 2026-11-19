import SectionTabs from "../SectionTabs";
import { getPendingPayments, getPaymentHistory, getPaymentStats } from "@/lib/actions/payments";
import PaymentCard from "./PaymentCard";
import PaymentHistoryTable from "./PaymentHistoryTable";
import { Clock, CheckCircle2, XCircle, DollarSign } from "lucide-react";
import { DashboardPage } from "../DashboardPage";

import { Suspense } from "react";
import { DataCards } from "../data-view/DataView";
import { parsePage, parsePageSize, parseRange } from "../data-view/filters";

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; from?: string; to?: string; size?: string; view?: string }>;
}) {
  const params = await searchParams;
  const range = parseRange(params.from, params.to);
  const size = parsePageSize(params.size, 10);

  const [pendingResult, historyResult, stats] = await Promise.all([
    getPendingPayments(),
    getPaymentHistory(parsePage(params.page), size, range),
    getPaymentStats(),
  ]);

  const inscriptions = pendingResult.inscriptions ?? [];
  const history = historyResult.inscriptions ?? [];
  const historyTotal = historyResult.total ?? 0;

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
    <DashboardPage
      title="Pagos"
      description="Valida comprobantes pendientes y consulta el historial de cobros."
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
        {statCards.map(({ icon: Icon, value, label, bgClass, textClass }) => (
          <div
            key={label}
            className="flex min-w-0 flex-col items-start gap-2 rounded-xl border border-card-border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-5"
          >
            <div className={`p-2.5 sm:p-3.5 ${bgClass} ${textClass} rounded-xl shrink-0`}>
              <Icon size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div className="min-w-0">
              <p className="break-all text-lg font-black leading-none text-foreground sm:text-2xl lg:text-3xl">
                {value}
              </p>
              <p className="text-[11px] sm:text-xs lg:text-sm text-muted font-bold mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <SectionTabs label="Secciones de pagos" initialTab={params.page || params.from || params.to || params.size || params.view ? 1 : 0}
        tabs={[
          {
            label: "Pagos pendientes", count: inscriptions.length,
            content: <DataCards title="Pagos pendientes" dateLabel="Fecha de recepción"
              items={inscriptions.map((inscription) => ({
                id: inscription.id,
                row: { date: inscription.createdAt, values: [inscription.user.name, inscription.user.email,
                  inscription.curso?.title ?? "Servicio de pastelería", inscription.method, `USD ${inscription.amountPaid}`, "Pendiente"] },
                card: <PaymentCard inscription={inscription} />,
              }))}
            />,
          },
          {
            label: "Historial de pagos",
            content: <Suspense>
              <PaymentHistoryTable inscriptions={history} total={historyTotal}
                page={historyResult.page ?? 1} size={size} range={range}
                mode={params.view === "grid" ? "grid" : "list"} />
            </Suspense>,
          },
        ]}
      />
    </DashboardPage>
  );
}
