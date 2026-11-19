"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import { useDataQuery } from "../data-view/use-data-query";
import { paymentMethods, periods, type OverviewFilter } from "./overview";

const field = "min-h-10 min-w-0 rounded-lg border border-card-border bg-card px-2 text-xs font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent";

export function OverviewFilters({ filter }: { filter: OverviewFilter }) {
  const { updateParams, isPending } = useDataQuery();
  const [error, setError] = useState("");
  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const from = String(form.get("from") ?? "");
    const to = String(form.get("to") ?? "");
    if (from && to && from > to) {
      setError("La fecha Hasta debe ser igual o posterior a Desde.");
      return;
    }
    setError("");
    const method = String(form.get("method") ?? "");
    if (from === filter.range.from && to === filter.range.to) {
      updateParams({ method });
    } else {
      updateParams({ from, to, period: from || to ? "" : "all", method });
    }
  }

  return (
    <section className="min-w-0 rounded-2xl border border-card-border bg-section-alt p-3 sm:p-4" aria-label="Filtros del resumen" aria-busy={isPending}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-xs font-bold text-foreground"><CalendarDays size={16} className="text-accent" /> Período de análisis</p>
        <p className="text-xs text-muted">{isPending ? "Actualizando…" : filter.range.from || filter.range.to
          ? `${filter.range.from || "Inicio"} a ${filter.range.to || "Hoy"} · Caracas` : "Histórico completo · Caracas"}</p>
      </div>
      <div className="flex flex-wrap items-end gap-2.5">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Períodos rápidos">
          {periods.map(({ id, label }) => (
            <button key={id} type="button" disabled={isPending} aria-pressed={filter.period === id}
              className={`${field} whitespace-nowrap hover:border-accent aria-pressed:border-accent aria-pressed:bg-accent-subtle aria-pressed:text-accent`}
              onClick={() => { setError(""); updateParams({ period: id, from: "", to: "" }); }}>{label}</button>
          ))}
        </div>
        <form key={`${filter.period}/${filter.range.from}/${filter.range.to}/${filter.method}`} onSubmit={apply}
          className="grid min-w-0 flex-[1_1_26rem] grid-cols-2 items-end gap-1.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <label className="grid min-w-0 gap-1 text-xs font-semibold text-muted">Desde<input type="date" name="from" defaultValue={filter.range.from} className={field} disabled={isPending} /></label>
          <label className="grid min-w-0 gap-1 text-xs font-semibold text-muted">Hasta<input type="date" name="to" defaultValue={filter.range.to} className={field} disabled={isPending} /></label>
          <label className="grid min-w-0 gap-1 text-xs font-semibold text-muted">Método de pago
            <select name="method" defaultValue={filter.method} className={field} disabled={isPending}>
              <option value="">Todos los métodos</option>
              {Object.entries(paymentMethods).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button type="submit" disabled={isPending} className="min-h-10 rounded-lg bg-accent-solid px-3 text-xs font-bold text-white hover:bg-accent-solid-hover disabled:opacity-50">Aplicar</button>
        </form>
      </div>
      <p className="mt-2 text-xs text-muted">Se usa la fecha de resolución para pagos aprobados y rechazados, y la de recepción para pendientes.</p>
      {error && <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </section>
  );
}
