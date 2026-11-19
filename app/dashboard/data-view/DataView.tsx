"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, FileDown, LayoutGrid, List } from "lucide-react";
import { emptyRange, matchesRange, pageSizes, recentDays, type DateRange, type ReportRow, type ViewMode } from "./filters";
import "./data-view.css";

const control = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-card-border bg-card px-3 text-xs font-bold text-foreground hover:border-accent focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40";

export function DataToolbar({ title, range, mode, onRange, onMode, report, total, busy, dateLabel }: {
  title: string;
  range: DateRange;
  mode: ViewMode;
  onRange: (range: DateRange) => void;
  onMode: (mode: ViewMode) => void;
  report: () => ReportRow[] | Promise<ReportRow[]>;
  total: number;
  busy?: boolean;
  dateLabel?: string;
}) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const rangeForm = useRef<HTMLFormElement>(null);

  async function exportReport() {
    setExporting(true);
    setError("");
    try {
      const [{ downloadReport }, rows] = await Promise.all([import("./download-report"), report()]);
      await downloadReport(title, range, rows);
    } catch {
      setError("No se pudo descargar el reporte. Inténtalo de nuevo.");
    } finally {
      setExporting(false);
    }
  }

  function applyRange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const from = String(data.get("from") ?? "");
    const to = String(data.get("to") ?? "");
    if (from && to && from > to) {
      setError("La fecha hasta debe ser igual o posterior a la fecha desde.");
      return;
    }
    setError("");
    onRange({ from, to });
  }

  function applyQuickRange(days: number) {
    const next = days ? recentDays(days) : emptyRange;
    rangeForm.current?.reset();
    setError("");
    onRange(next);
  }

  return (
    <div className="mb-4 space-y-3 rounded-xl border border-card-border bg-section-alt p-3 sm:p-4">
      <form ref={rangeForm} key={range.from + "/" + range.to} onSubmit={applyRange} aria-label={`Fechas de ${title}`} className="flex flex-wrap items-end gap-2">
        {dateLabel && <p className="w-full text-xs font-semibold text-muted">{dateLabel}</p>}
        <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-muted">
          Desde <input type="date" name="from" defaultValue={range.from} className={control} disabled={busy} />
        </label>
        <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-muted">
          Hasta <input type="date" name="to" defaultValue={range.to} className={control} disabled={busy} />
        </label>
        <button className={control} disabled={busy}>Aplicar</button>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Rangos rápidos" className="flex flex-wrap gap-1">
          {[[1, "Hoy"], [7, "7 días"], [30, "30 días"], [90, "90 días"], [0, "Todos"]].map(([days, label]) => (
            <button key={days} type="button" className={control} disabled={busy} onClick={() => applyQuickRange(Number(days))}>{label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          <div role="group" aria-label="Modo de vista" className="flex gap-1">
            <button type="button" className={`${control} aria-pressed:border-accent aria-pressed:bg-accent-subtle`} aria-pressed={mode === "list"} disabled={busy} onClick={() => onMode("list")}><List size={15} />Lista</button>
            <button type="button" className={`${control} aria-pressed:border-accent aria-pressed:bg-accent-subtle`} aria-pressed={mode === "grid"} disabled={busy} onClick={() => onMode("grid")}><LayoutGrid size={15} />Cuadrícula</button>
          </div>
          <button type="button" className={control} disabled={busy || exporting || total === 0} onClick={exportReport}>
            <FileDown size={15} />{exporting ? "Generando…" : "Exportar PDF"}
          </button>
        </div>
      </div>
      {(range.from || range.to) && <p className="text-xs text-muted">Rango activo · {range.from || "Inicio"} a {range.to || "Actualidad"}</p>}
      {error && <p role="alert" className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function DataPaginator({ title, page, size, total, onPage, onSize, busy }: {
  title: string;
  page: number;
  size: number;
  total: number;
  onPage: (page: number) => void;
  onSize: (size: number) => void;
  busy?: boolean;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <nav aria-label={`Paginación de ${title}`} className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-card-border bg-section-alt p-3 text-xs text-muted">
      <p aria-live="polite">{total ? `${(page - 1) * size + 1}–${Math.min(page * size, total)} de ${total} registros` : "0 registros"}</p>
      <label className="flex items-center gap-2">Por página
        <select className={control} value={size} disabled={busy} onChange={(event) => onSize(Number(event.target.value))}>
          {pageSizes.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </label>
      <div className="flex items-center gap-1">
        <button type="button" className={control} aria-label="Página anterior" disabled={busy || page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={16} /></button>
        <span className="px-2 tabular-nums">{page} / {pages}</span>
        <button type="button" className={control} aria-label="Página siguiente" disabled={busy || page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={16} /></button>
      </div>
    </nav>
  );
}

export function DataView<T>({ title, items, row, children, initialMode = "list", empty, dateLabel, filterKey }: {
  title: string;
  items: readonly T[];
  row: (item: T) => ReportRow;
  children: (items: T[], mode: ViewMode) => ReactNode;
  initialMode?: ViewMode;
  empty?: ReactNode;
  dateLabel?: string;
  filterKey?: string;
}) {
  const id = useId();
  const [range, setRange] = useState(emptyRange);
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const [size, setSize] = useState(10);
  const [position, setPosition] = useState({ page: 1, filterKey });
  const matching = range.from || range.to ? items.filter((item) => matchesRange(row(item).date, range)) : items;
  const page = Math.min(position.filterKey === filterKey ? position.page : 1, Math.max(1, Math.ceil(matching.length / size)));
  const goToPage = (page: number) => setPosition({ page, filterKey });

  return (
    <section aria-labelledby={id} className="min-w-0">
      <span id={id} className="sr-only">{title}</span>
      <DataToolbar title={title} range={range} mode={mode} total={matching.length} dateLabel={dateLabel}
        report={() => matching.map(row)} onMode={setMode} onRange={(next) => { setRange(next); goToPage(1); }} />
      <div data-view-mode={mode} className="min-w-0">
        {matching.length ? children(matching.slice((page - 1) * size, page * size), mode) : empty ??
          <p className="rounded-xl border border-card-border bg-card p-8 text-center text-sm text-muted">No hay registros para los filtros seleccionados.</p>}
      </div>
      <DataPaginator title={title} page={page} size={size} total={matching.length} onPage={goToPage}
        onSize={(next) => { setSize(next); goToPage(1); }} />
    </section>
  );
}

export function DataCards({ title, items, initialMode, dateLabel, empty }: {
  title: string;
  items: { id: string; row: ReportRow; card: ReactNode }[];
  initialMode?: ViewMode;
  dateLabel?: string;
  empty?: ReactNode;
}) {
  return <DataView title={title} items={items} row={(item) => item.row} initialMode={initialMode} dateLabel={dateLabel} empty={empty}>
    {(visible) => <div className="dashboard-data-cards">{visible.map(({ id, card }) => <div key={id} className="min-w-0">{card}</div>)}</div>}
  </DataView>;
}
