import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, Tag, ShieldAlert } from "lucide-react";

/** Convierte el JSON de detalles en texto legible */
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
  CREATE:  "bg-green-50 text-green-600",
  UPDATE:  "bg-indigo-50 text-[#5A4FCF]",
  DELETE:  "bg-red-50 text-red-600",
  APPROVE: "bg-emerald-50 text-emerald-600",
  REVOKE:  "bg-orange-50 text-orange-500",
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
  TALLER:      "Taller",
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
    <div className="p-8">
      <div className="mb-10 flex items-center gap-4">
        <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#1A1A2E]">Registro de Actividad</h1>
          <p className="text-gray-400 font-medium">Panel de auditoría del sistema (Solo Administradores).</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-gray-400 italic text-center py-6">No hay registros de actividad aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-black uppercase tracking-widest text-gray-400">
                  <th className="pb-4 pl-4">Fecha</th>
                  <th className="pb-4">Usuario</th>
                  <th className="pb-4">Acción</th>
                  <th className="pb-4">Entidad</th>
                  <th className="pb-4">Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {/* Fecha */}
                    <td className="py-4 pl-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-300" />
                        {new Date(log.createdAt).toLocaleString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Usuario */}
                    <td className="py-4 text-sm font-bold text-[#1A1A2E]">
                      <div className="flex flex-col">
                        <span>{log.user.name || "Sin nombre"}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                          {log.user.email}
                        </span>
                      </div>
                    </td>

                    {/* Acción */}
                    <td className="py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-widest inline-block ${
                        ACTION_STYLES[log.action] ?? "bg-gray-100 text-gray-500"
                      }`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>

                    {/* Entidad */}
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600">
                        <Tag size={13} className="text-[#5A4FCF]" />
                        {ENTITY_LABELS[log.entityType] ?? log.entityType}
                      </div>
                    </td>

                    {/* Detalles — legible */}
                    <td className="py-4 pr-4">
                      <span className="text-sm text-gray-500 font-medium">
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
