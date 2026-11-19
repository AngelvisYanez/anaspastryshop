"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
import { Activity, ArrowUpRight, BadgeCheck, ChartNoAxesCombined, CircleDollarSign, Clock3, CreditCard, Percent, SlidersHorizontal, UserRoundPlus, XCircle } from "lucide-react";
import SectionTabs from "./SectionTabs";
import { OverviewFilters } from "./admin-overview/OverviewFilters";
import { WidgetEditor } from "./admin-overview/WidgetEditor";
import { paymentMethods, paymentStatuses, type ChartItem, type OverviewFilter, type OverviewStats } from "./admin-overview/overview";
import { defaultWidgetSnapshot, readWidgets, widgets, type Widget, type WidgetId } from "./admin-overview/widgets";

const OverviewChart = dynamic(() => import("./admin-overview/OverviewChart"), {
  ssr: false,
  loading: () => <div aria-label="Cargando gráfico" className="h-60 animate-pulse rounded-xl bg-section-alt" />,
});
const money = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD", currencyDisplay: "code" });
const count = new Intl.NumberFormat("es-VE");
const percent = new Intl.NumberFormat("es-VE", { style: "percent", maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("es-VE", { dateStyle: "medium", timeZone: "America/Caracas" });
const day = new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "short", timeZone: "UTC" });
const month = new Intl.DateTimeFormat("es-VE", { month: "short", year: "2-digit", timeZone: "UTC" });

function subscribeToWidgets(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("admin-dashboard-widgets", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("admin-dashboard-widgets", listener);
  };
}

export function AdminDashboardHome({ adminId, stats, filter }: {
  adminId: string; stats: OverviewStats; filter: OverviewFilter;
}) {
  const storageKey = `admin-dashboard-widgets:v1:${adminId}`;
  const getSnapshot = useCallback(() => {
    try { return localStorage.getItem(storageKey) ?? defaultWidgetSnapshot; }
    catch { return defaultWidgetSnapshot; }
  }, [storageKey]);
  const snapshot = useSyncExternalStore(subscribeToWidgets, getSnapshot, () => defaultWidgetSnapshot);
  const [temporary, setTemporary] = useState<Widget[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const selected = temporary ?? readWidgets(snapshot);

  function save(next: Widget[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event("admin-dashboard-widgets"));
      setTemporary(null);
      setMessage("Panel guardado.");
    } catch {
      setTemporary(next);
      setMessage("Panel actualizado para esta visita. El navegador no pudo guardar las preferencias.");
    }
    setEditing(false);
  }

  const metrics = {
    revenue: { value: money.format(stats.revenue), icon: CircleDollarSign },
    approved: { value: count.format(stats.statuses.APPROVED), icon: BadgeCheck },
    pending: { value: count.format(stats.statuses.PENDING), icon: Clock3 },
    rejected: { value: count.format(stats.statuses.REJECTED), icon: XCircle },
    students: { value: count.format(stats.registrations), icon: UserRoundPlus },
    average: { value: stats.average === null ? "—" : money.format(stats.average), icon: CreditCard },
    approvalRate: { value: stats.approvalRate === null ? "—" : percent.format(stats.approvalRate), icon: Percent },
  };
  const temporal = (key: "revenue" | "students" | "approvals") => stats.timeline.map((point) => ({
    name: (filter.bucket === "month" ? month : day).format(new Date(`${point.day}T00:00:00Z`)),
    value: point[key],
  }));
  const chartData = {
    revenueTrend: temporal("revenue"),
    studentsTrend: temporal("students"),
    approvalsTrend: temporal("approvals"),
    methods: stats.methods,
    statuses: Object.entries(stats.statuses).map(([id, value]) => ({
      name: paymentStatuses[id as keyof typeof paymentStatuses], value,
    })),
    topCourses: stats.topCourses,
  } satisfies Partial<Record<WidgetId, ChartItem[]>>;
  const interval = { day: "Por día", week: "Por semana", month: "Por mes" }[filter.bucket];

  const dashboard = selected.length ? (
    <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12">
      {selected.map((item) => {
        const definition = widgets[item.id];
        const metric = item.id in metrics ? metrics[item.id as keyof typeof metrics] : null;
        if (metric) {
          const Icon = metric.icon;
          return (
            <article key={item.id} className={`min-w-0 rounded-2xl border border-card-border bg-card p-3 shadow-sm sm:p-4 ${item.wide ? "col-span-full" : "lg:col-span-4"}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-subtle text-accent"><Icon size={18} aria-hidden="true" /></span>
                {item.id === "pending" && <Link href="/dashboard/pagos" aria-label="Ir a pagos pendientes" className="rounded-lg p-2 text-muted hover:bg-section-alt hover:text-accent"><ArrowUpRight size={16} /></Link>}
              </div>
              <h3 className="mt-3 text-xs font-bold text-muted sm:text-sm">{definition.label}</h3>
              <p className="mt-1 break-words text-lg font-black leading-tight tabular-nums text-foreground sm:text-2xl">{metric.value}</p>
              <p className="mt-1.5 text-xs leading-snug text-muted">{definition.description}</p>
            </article>
          );
        }
        const data = chartData[item.id as keyof typeof chartData];
        return (
          <article key={item.id} className={`col-span-2 min-w-0 rounded-2xl border border-card-border bg-card p-3 shadow-sm sm:p-5 ${item.wide ? "lg:col-span-12" : "lg:col-span-6"}`}>
            <header className="mb-4 flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-section-alt text-accent"><ChartNoAxesCombined size={17} aria-hidden="true" /></span>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-foreground sm:text-base">{definition.label}</h3>
                <p className="mt-0.5 text-xs text-muted">{definition.description}{definition.kind === "trend" ? ` · ${interval}` : ""}</p>
              </div>
            </header>
            <OverviewChart data={data} chart={item.chart} label={definition.label}
              categorical={definition.kind === "breakdown"} currency={item.id === "methods" || item.id === "revenueTrend"} />
          </article>
        );
      })}
    </div>
  ) : <div className="rounded-2xl border border-dashed border-card-border bg-card p-8 text-center text-sm text-muted">
    El panel está vacío. Añade tus indicadores y gráficos en Personalizar widgets.
  </div>;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-foreground sm:text-lg">Rendimiento del negocio</h2>
          {filter.method && <p className="text-xs text-muted">Método activo: {paymentMethods[filter.method]}. Los registros de alumnos se filtran por fecha.</p>}
        </div>
        <button type="button" onClick={() => { setMessage(""); setEditing(true); }} aria-haspopup="dialog"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-card-border bg-card px-3 text-sm font-bold text-accent hover:bg-accent-subtle">
          <SlidersHorizontal size={16} />Personalizar widgets
        </button>
      </div>
      {message && <p role="status" className="text-xs font-semibold text-muted">{message}</p>}
      <OverviewFilters filter={filter} />
      <SectionTabs label="Resumen de administración" tabs={[
        { label: "Indicadores y gráficos", content: dashboard },
        { label: "Actividad reciente", content: <OverviewActivity stats={stats} /> },
      ]} />
      {editing && <WidgetEditor initial={selected} onClose={() => setEditing(false)} onSave={save} />}
    </div>
  );
}

function OverviewActivity({ stats }: { stats: OverviewStats }) {
  return (
    <section aria-labelledby="overview-activity" className="rounded-2xl border border-card-border bg-card p-3 sm:p-5">
      <header className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 id="overview-activity" className="flex items-center gap-2 font-black text-foreground"><Activity size={17} className="text-accent" /> Últimos pagos del período</h3>
        <Link href="/dashboard/pagos" className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-accent">Abrir pagos <ArrowUpRight size={14} /></Link>
      </header>
      {stats.activity.length ? (
        <ul className="divide-y divide-card-border">
          {stats.activity.map((payment) =>
            <li key={`${payment.id}-${payment.method}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 py-3 text-sm sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <p className="break-words font-bold text-foreground">{payment.title ?? "Servicio de pastelería"}</p>
                <p className="break-words text-xs text-muted">{payment.name || payment.email}</p>
              </div>
              <div className="col-start-1 row-start-2 text-xs text-muted sm:col-auto sm:row-auto">
                <p>{paymentMethods[payment.method]}</p><time dateTime={payment.at.toISOString()}>{date.format(payment.at)}</time>
              </div>
              <div className="col-start-2 row-span-2 row-start-1 text-right sm:col-auto sm:row-auto">
                <p className="font-bold tabular-nums text-foreground">{money.format(payment.amount)}</p>
                <span className="text-xs text-muted">{{ APPROVED: "Aprobado", PENDING: "Pendiente", REJECTED: "Rechazado" }[payment.status]}</span>
              </div>
            </li>
          )}
        </ul>
      ) : <p className="py-8 text-center text-sm text-muted">No hay pagos con los filtros seleccionados.</p>}
    </section>
  );
}
