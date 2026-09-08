"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Calendar, Tag, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

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
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Crear",
  UPDATE: "Editar",
  DELETE: "Eliminar",
  APPROVE: "Aprobar",
  REVOKE: "Revocar",
  REGISTER: "Registro",
  APPROVE_PAYMENT: "Pago aprobado",
};

const ENTITY_LABELS: Record<string, string> = {
  USER: "Usuario",
  CURSO: "Curso / Workshop",
  CATEGORY: "Categoría",
  INSCRIPTION: "Inscripción",
};

const ENTITY_COLORS: Record<string, string> = {
  USER: "text-blue-500",
  CURSO: "text-emerald-500",
  CATEGORY: "text-amber-500",
  INSCRIPTION: "text-accent",
};

function formatDetails(raw: string | null): string {
  if (!raw) return "—";
  try {
    const obj = JSON.parse(raw);
    const labels: Record<string, string> = {
      title: "Título", name: "Nombre", email: "Email",
      role: "Rol", message: "Mensaje", status: "Estado",
      type: "Tipo", method: "Método",
    };
    const roleNames: Record<string, string> = {
      USER: "Alumno", ADMIN: "Administrador",
    };
    const parts = Object.entries(obj)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => {
        const label = labels[k] || k;
        const value = k === "role" ? (roleNames[v as string] ?? v) : String(v);
        return `${label}: ${value}`;
      });
    return parts.length > 0 ? parts.join(" · ") : "Sin detalles";
  } catch {
    return raw;
  }
}

const ALL_ACTIONS = [
  { value: "", label: "Todas las acciones" },
  { value: "CREATE", label: "Crear" },
  { value: "UPDATE", label: "Editar" },
  { value: "DELETE", label: "Eliminar" },
  { value: "APPROVE", label: "Aprobar" },
  { value: "REVOKE", label: "Revocar" },
  { value: "REGISTER", label: "Registro" },
  { value: "APPROVE_PAYMENT", label: "Pago aprobado" },
];

const PAGE_SIZE = 20;

export default function LogsClient({
  logs,
  total,
  page,
  search,
  action,
}: {
  logs: Log[];
  total: number;
  page: number;
  search: string;
  action: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v);
        else params.delete(k);
      });
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

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
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Buscar usuario..."
              className="w-full bg-card border border-card-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-accent transition-all text-foreground placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-card border border-card-border rounded-xl text-sm font-bold text-muted hover:text-accent hover:border-accent transition-all"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted shrink-0" />
          <select
            value={action}
            onChange={(e) => updateParams({ action: e.target.value, page: "1" })}
            className="bg-card border border-card-border rounded-xl px-3 py-2.5 text-sm font-medium text-foreground outline-none focus:border-accent transition-all"
          >
            {ALL_ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={`bg-card rounded-xl border border-card-border shadow-sm overflow-hidden transition-opacity ${isPending ? "opacity-60" : ""}`}>
        {logs.length === 0 ? (
          <div className="flex flex-col items-center py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-section-alt flex items-center justify-center mb-4">
              <Calendar size={20} className="text-muted/40" />
            </div>
            <p className="text-sm font-bold text-muted">Sin registros</p>
            <p className="text-xs text-muted/60 mt-1">No se encontraron eventos con los filtros aplicados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-card-border bg-section-alt/60">
                  <th className="py-3 pl-5 pr-3 text-[11px] font-black uppercase tracking-widest text-muted w-36">#&nbsp;&nbsp;Fecha</th>
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-widest text-muted">Usuario</th>
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-widest text-muted">Acción</th>
                  <th className="py-3 px-3 text-[11px] font-black uppercase tracking-widest text-muted">Entidad</th>
                  <th className="py-3 pl-3 pr-5 text-[11px] font-black uppercase tracking-widest text-muted">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {logs.map((log, i) => (
                  <tr key={log.id} className="hover:bg-card-hover transition-colors group">
                    <td className="py-4 pl-5 pr-3 whitespace-nowrap">
                      <div className="flex items-start gap-2">
                        <span className="text-[11px] font-bold text-muted/40 tabular-nums mt-0.5 w-5 text-right shrink-0">
                          {from + i}
                        </span>
                        <div className="flex flex-col">
                          <span suppressHydrationWarning className="text-xs font-bold text-foreground">
                            {new Date(log.createdAt).toLocaleDateString("es-ES", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                          <span suppressHydrationWarning className="text-[11px] text-muted font-medium">
                            {new Date(log.createdAt).toLocaleTimeString("es-ES", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground truncate max-w-[160px]">
                          {log.user.name || "Sin nombre"}
                        </span>
                        <span className="text-[11px] text-muted font-medium truncate max-w-[160px]">
                          {log.user.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black tracking-widest inline-block whitespace-nowrap ${
                        ACTION_STYLES[log.action] ?? "bg-section-alt text-muted border border-card-border"
                      }`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <div className={`flex items-center gap-1.5 text-xs font-bold whitespace-nowrap ${
                        ENTITY_COLORS[log.entityType] ?? "text-muted"
                      }`}>
                        <Tag size={11} />
                        {ENTITY_LABELS[log.entityType] ?? log.entityType}
                      </div>
                    </td>

                    <td className="py-4 pl-3 pr-5 text-xs text-muted font-medium max-w-xs">
                      <span className="line-clamp-2">{formatDetails(log.details)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted font-medium">
          {total === 0
            ? "Sin resultados"
            : `Mostrando ${from}–${to} de ${total} eventos`}
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => updateParams({ page: String(page - 1) })}
            disabled={page <= 1 || isPending}
            className="p-2 bg-card border border-card-border rounded-xl text-muted hover:text-foreground disabled:opacity-30 transition-all"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-3 py-1.5 text-xs font-bold text-foreground">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => updateParams({ page: String(page + 1) })}
            disabled={page >= totalPages || isPending}
            className="p-2 bg-card border border-card-border rounded-xl text-muted hover:text-foreground disabled:opacity-30 transition-all"
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
