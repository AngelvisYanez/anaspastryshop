import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, Tag, ShieldAlert } from "lucide-react";

function formatDetails(raw: string | null): string {
  if (!raw) return "—";
  try {
    const obj = JSON.parse(raw);
    const labels: Record<string, string> = {
      title: "Título",
      name: "Nombre",
      email: "Email",
      role: "Rol",
      message: "Mensaje",
    };
    const roleNames: Record<string, string> = {
      USER: "Alumno",
      MENTOR: "Mentor",
      ADMIN: "Administrador",
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

const ACTION_STYLES: Record<string, string> = {
  CREATE:  "bg-green-50 dark:bg-green-950/20 text-green-600",
  UPDATE:  "bg-amber-50 dark:bg-amber-950/20 text-accent",
  DELETE:  "bg-red-50 dark:bg-red-950/20 text-red-600",
  APPROVE: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600",
  REVOKE:  "bg-orange-50 dark:bg-orange-950/20 text-orange-500",
};

const ACTION_LABELS: Record<string, string> = {
  CREATE:  "Crear",
  UPDATE:  "Editar",
  DELETE:  "Eliminar",
  APPROVE: "Aprobar",
  REVOKE:  "Revocar",
};

const ENTITY_LABELS: Record<string, string> = {
  USER:        "Usuario",
  MENTOR:      "Mentor",
  CURSO:       "Curso",
  CATEGORY:    "Categoría",
  INSCRIPTION: "Inscripción",
};

export default async function LogsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, role: true } },
    },
    take: 100,
  });

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-lg">
          <ShieldAlert size={26} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-foreground">Registro de Actividad</h1>
          <p className="text-muted font-medium">Panel de auditoría del sistema (Solo Administradores).</p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 sm:p-8 border border-card-border shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-muted italic text-center py-6">No hay registros de actividad aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-card-border text-[10px] font-black uppercase tracking-widest text-muted bg-section-alt">
                  <th className="pb-3 pl-4 pt-3">Fecha</th>
                  <th className="pb-3 pt-3">Usuario</th>
                  <th className="pb-3 pt-3">Acción</th>
                  <th className="pb-3 pt-3">Entidad</th>
                  <th className="pb-3 pt-3">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-card-border hover:bg-card-hover transition-colors">
                    <td className="py-3.5 pl-4 text-sm font-medium text-muted whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-muted/40" />
                        {new Date(log.createdAt).toLocaleString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 text-sm font-bold text-foreground">
                      <div className="flex flex-col">
                        <span>{log.user.name || "Sin nombre"}</span>
                        <span className="text-[10px] text-muted uppercase tracking-wider font-medium">
                          {log.user.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span className={`px-3 py-1 rounded-md text-xs font-black tracking-widest inline-block ${
                        ACTION_STYLES[log.action] ?? "bg-section-alt text-muted"
                      }`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                        <Tag size={12} className="text-accent" />
                        {ENTITY_LABELS[log.entityType] ?? log.entityType}
                      </div>
                    </td>

                    <td className="py-3.5 pr-4">
                      <span className="text-sm text-muted font-medium">
                        {formatDetails(log.details)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
