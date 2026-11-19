"use client";



import { Calendar, Tag, Search, Filter } from "lucide-react";

type Log = {
  id: string;
  action: string;
  entityType: string;
  details: string | null;
  createdAt: Date;
  user: { name: string | null; email: string | null; role: string };
};

const ACTION_STYLES: Record<string, string> = {
  CREATE: "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
  UPDATE: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  DELETE: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  APPROVE: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  REVOKE: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
  REGISTER: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  APPROVE_PAYMENT: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  APPROVE_PASTRY_PAYMENT: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  APPROVE_COURSE_PAYMENT: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  REJECT_PAYMENT: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800",
  COURSE_PAYMENT_SUBMITTED: "bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  PASTRY_SERVICE_PAYMENT_SUBMITTED: "bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-800",
  REACTIVATE: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
  SUSPEND: "bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800",
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Creó",
  UPDATE: "Editó",
  DELETE: "Eliminó",
  APPROVE: "Aprobó",
  REVOKE: "Revocó",
  REGISTER: "Nuevo registro",
  APPROVE_PAYMENT: "Aprobó un pago",
  APPROVE_PASTRY_PAYMENT: "Aprobó pago de pastelería",
  APPROVE_COURSE_PAYMENT: "Aprobó pago de formación",
  REJECT_PAYMENT: "Rechazó un pago",
  COURSE_PAYMENT_SUBMITTED: "Envió comprobante de formación",
  PASTRY_SERVICE_PAYMENT_SUBMITTED: "Envió comprobante de pastelería",
  REACTIVATE: "Reactivó cuenta",
  SUSPEND: "Suspendió cuenta",
};

const ENTITY_LABELS: Record<string, string> = {
  USER: "Usuario",
  CURSO: "Curso / Workshop",
  CATEGORY: "Categoría",
  INSCRIPTION: "Pago / Inscripción",
};

const ENTITY_COLORS: Record<string, string> = {
  USER: "text-blue-500",
  CURSO: "text-emerald-500",
  CATEGORY: "text-amber-500",
  INSCRIPTION: "text-accent",
};

const DETAIL_KEY_LABELS: Record<string, string> = {
  title: "Título",
  name: "Nombre",
  email: "Correo",
  role: "Rol",
  message: "Mensaje",
  status: "Estado",
  type: "Tipo",
  method: "Método de pago",
  amount: "Monto",
  reason: "Motivo",
  description: "Descripción",
  cursoId: "Curso",
  targetId: "Curso",
  targetIds: "Formaciones en la bolsa",
};

const DETAIL_VALUE_LABELS: Record<string, Record<string, string>> = {
  role: {
    USER: "Alumno",
    ADMIN: "Administrador",
  },
  status: {
    APPROVED: "Aprobado",
    REJECTED: "Rechazado",
    PENDING: "Pendiente",
    COMPLETED: "Completado",
  },
  type: {
    CURSO: "Curso / Workshop",
    PASTRY_SERVICE: "Servicio de pastelería",
    BAG: "Bolsa de compras",
  },
  method: {
    BANK_TRANSFER: "Transferencia bancaria",
    TRANSFERENCIA: "Transferencia",
    ZELLE: "Zelle",
    PAGO_MOVIL: "Pago móvil",
    BINANCE: "Binance Pay",
    USDT: "USDT",
    STRIPE: "Stripe",
  },
};

const HIDDEN_DETAIL_KEYS = new Set(["entityId", "userId", "id"]);

function humanizeKey(key: string): string {
  if (DETAIL_KEY_LABELS[key]) return DETAIL_KEY_LABELS[key];
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\bid\b/gi, "")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function formatDetailValue(key: string, value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed.toUpperCase() === "N/A") return null;
    const mapped = DETAIL_VALUE_LABELS[key]?.[trimmed];
    if (mapped) return mapped;
    if (key === "amount" && !Number.isNaN(Number(trimmed))) {
      return `$${Number(trimmed).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} USD`;
    }
    return trimmed;
  }

  if (typeof value === "number") {
    if (key === "amount") {
      return `$${value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })} USD`;
    }
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Sí" : "No";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    if (key === "targetIds") {
      return `${value.length} formación${value.length === 1 ? "" : "es"}`;
    }
    return value.map(String).join(", ");
  }

  return String(value);
}

function formatDetails(raw: string | null): string {
  if (!raw) return "Sin información adicional";
  try {
    const obj = JSON.parse(raw);
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      return raw;
    }

    const parts = Object.entries(obj)
      .filter(([k]) => !HIDDEN_DETAIL_KEYS.has(k))
      .map(([k, v]) => {
        const formatted = formatDetailValue(k, v);
        if (!formatted) return null;
        if (
          (k === "cursoId" || k === "targetId") &&
          /^[a-z0-9_-]{16,}$/i.test(formatted)
        ) {
          return null;
        }
        return `${humanizeKey(k)}: ${formatted}`;
      })
      .filter(Boolean) as string[];

    return parts.length > 0 ? parts.join(" · ") : "Sin información adicional";
  } catch {
    return raw;
  }
}

const ALL_ACTIONS = [
  { value: "", label: "Todas las acciones" },
  { value: "REGISTER", label: "Nuevo registro" },
  { value: "COURSE_PAYMENT_SUBMITTED", label: "Comprobante de formación" },
  { value: "PASTRY_SERVICE_PAYMENT_SUBMITTED", label: "Comprobante de pastelería" },
  { value: "APPROVE_COURSE_PAYMENT", label: "Pago de formación aprobado" },
  { value: "APPROVE_PASTRY_PAYMENT", label: "Pago de pastelería aprobado" },
  { value: "REJECT_PAYMENT", label: "Pago rechazado" },
  { value: "UPDATE", label: "Edición" },
  { value: "DELETE", label: "Eliminación" },
  { value: "SUSPEND", label: "Suspensión de cuenta" },
  { value: "REACTIVATE", label: "Reactivación de cuenta" },
  { value: "CREATE", label: "Creación" },
  { value: "APPROVE", label: "Aprobación" },
  { value: "REVOKE", label: "Revocación" },
];

import { DataPaginator, DataToolbar } from "../data-view/DataView";
import type { DateRange, ViewMode } from "../data-view/filters";
import { useDataQuery } from "../data-view/use-data-query";
import { getLogReport } from "./report-action";

export default function LogsClient({
  logs,
  total,
  page,
  size,
  range,
  mode,
  search,
  action,
}: {
  logs: Log[];
  total: number;
  page: number;
  size: number;
  range: DateRange;
  mode: ViewMode;
  search: string;
  action: string;
}) {
  const { updateParams, isPending } = useDataQuery();
  const from = (page - 1) * size + 1;

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const val = (e.currentTarget.elements.namedItem("search") as HTMLInputElement).value.trim();
    updateParams({ search: val, page: "1" });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <label htmlFor="logs-search" className="sr-only">Buscar usuario en los logs</label>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="logs-search"
              name="search"
            key={search}
            defaultValue={search}
            disabled={isPending}
              placeholder="Buscar usuario..."
              className="w-full bg-card border border-card-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-accent transition text-foreground placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2.5 bg-card border border-card-border rounded-xl text-sm font-bold text-muted hover:text-accent hover:border-accent transition"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-2">
          <label htmlFor="logs-action" className="sr-only">Filtrar por acción</label>
          <Filter size={14} className="text-muted shrink-0" />
          <select
            id="logs-action"
            value={action}
            disabled={isPending}
            onChange={(e) => updateParams({ action: e.target.value, page: "1" })}
            className="bg-card border border-card-border rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-accent transition max-w-[240px]"
          >
            {ALL_ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      <DataToolbar title="Registro de eventos" range={range} mode={mode} total={total} busy={isPending}
        onRange={(range) => updateParams({ ...range, page: "" })}
        onMode={(mode) => updateParams({ view: mode })}
        report={async () => (await getLogReport(search, action, range)).map((log) => ({
          date: log.createdAt,
          values: [log.user.name, log.user.email, ACTION_LABELS[log.action] ?? log.action,
            ENTITY_LABELS[log.entityType] ?? log.entityType, formatDetails(log.details)],
        }))}
      />

      <div data-view-mode={mode} className={`bg-card rounded-xl border border-card-border shadow-sm overflow-hidden transition-opacity ${isPending ? "opacity-60" : ""}`}>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-section-alt flex items-center justify-center mb-4">
              <Calendar size={20} className="text-muted/40" />
            </div>
            <p className="text-sm font-bold text-muted">Sin registros</p>
            <p className="text-xs text-muted/60 mt-1">No se encontraron eventos con los filtros aplicados</p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="dashboard-data-table w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-card-border bg-section-alt/60">
                  <th className="py-3 pl-5 pr-3 text-[11px] font-black uppercase tracking-widest text-muted w-36">Fecha</th>
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-widest text-muted">Quién lo hizo</th>
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-widest text-muted">Qué ocurrió</th>
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-widest text-muted">Sobre qué</th>
                  <th className="py-3 pl-3 pr-5 text-[11px] font-black uppercase tracking-widest text-muted">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {logs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-card-hover transition-colors group">
                    <td data-label="Fecha" className="py-4 pl-5 pr-3 whitespace-nowrap">
                      <div className="flex items-start gap-2">
                        <span className="text-[11px] font-bold text-muted/40 tabular-nums mt-0.5 w-5 text-right shrink-0">
                          {from + i}
                        </span>
                        <div className="flex flex-col">
                          <span suppressHydrationWarning className="text-xs font-bold text-foreground">
                            {new Date(log.createdAt).toLocaleDateString("es-ES", {
                              timeZone: "America/Caracas", day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                          <span suppressHydrationWarning className="text-[11px] text-muted font-medium">
                            {new Date(log.createdAt).toLocaleTimeString("es-ES", {
                              timeZone: "America/Caracas", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td data-label="Usuario" className="py-4 px-3">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground truncate max-w-[160px]">
                          {log.user.name || "Sin nombre"}
                        </span>
                        <span className="text-[11px] text-muted font-medium truncate max-w-[160px]">
                          {log.user.email}
                        </span>
                      </div>
                    </td>

                    <td data-label="Acción" className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black tracking-wide inline-block whitespace-nowrap ${
                        ACTION_STYLES[log.action] ?? "bg-section-alt text-muted border border-card-border"
                      }`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>

                    <td data-label="Entidad" className="py-4 px-3">
                      <div className={`flex items-center gap-1.5 text-xs font-bold whitespace-nowrap ${
                        ENTITY_COLORS[log.entityType] ?? "text-muted"
                      }`}>
                        <Tag size={11} />
                        {ENTITY_LABELS[log.entityType] ?? log.entityType}
                      </div>
                    </td>

                    <td data-label="Detalles" className="py-4 pl-3 pr-5 text-xs text-muted font-medium max-w-sm">
                      <span className="line-clamp-3 leading-relaxed">{formatDetails(log.details)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DataPaginator title="Registro de eventos" page={page} size={size} total={total} busy={isPending}
        onPage={(page) => updateParams({ page: String(page) })}
        onSize={(size) => updateParams({ size: String(size), page: "" })} />
    </div>
  );
}
