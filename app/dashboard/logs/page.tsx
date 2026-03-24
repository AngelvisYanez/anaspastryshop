import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Activity, Calendar, User, Tag, ShieldAlert } from "lucide-react";

export default async function LogsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true, role: true },
      },
    },
    take: 100, // Limitar a los 100 más recientes para rendimiento
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
                    <td className="py-4 pl-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 text-sm font-bold text-[#1A1A2E]">
                      <div className="flex flex-col">
                        <span>{log.user.name || "Sin Nombre"}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{log.user.email}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-widest w-fit block ${
                        log.action === "CREATE" ? "bg-green-50 text-green-600" :
                        log.action === "DELETE" ? "bg-red-50 text-red-600" :
                        "bg-indigo-50 text-[#5A4FCF]"
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5 text-sm font-bold text-gray-600">
                        <Tag size={14} className="text-[#5A4FCF]" /> {log.entityType}
                      </div>
                    </td>
                    <td className="py-4">
                      <pre className="text-[10px] text-gray-500 bg-gray-50 p-2 rounded-xl max-w-sm overflow-x-auto">
                        {log.details ? log.details : "-"}
                      </pre>
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
