import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Video, Plus, Calendar, Users } from "lucide-react";
import WebinarActions from "./WebinarActions";

const STATUS_CONFIG = {
  SCHEDULED: { label: "Programado", class: "bg-indigo-50 text-[#5A4FCF]", dot: "bg-indigo-400" },
  LIVE: { label: "En Vivo", class: "bg-green-50 text-green-600", dot: "bg-green-500 animate-pulse" },
  ENDED: { label: "Finalizado", class: "bg-gray-100 text-gray-400", dot: "bg-gray-300" },
};

export default async function WebinarsDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = (session.user as any).role as string;
  if (role !== "ADMIN") redirect("/dashboard");

  const webinars = await prisma.webinar.findMany({
    include: { instructor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const enVivo = webinars.filter((w) => w.status === "LIVE").length;
  const programados = webinars.filter((w) => w.status === "SCHEDULED").length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#1A1A2E]">Webinars & Meetings</h1>
          <p className="text-gray-400 font-medium">Gestiona tus sesiones en tiempo real con RealtimeKit.</p>
        </div>
        <Link href="/dashboard/webinars/create">
          <button className="bg-[#5A4FCF] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#483dbb] transition-all shadow-lg shadow-indigo-100">
            <Plus size={20} /> Nuevo Webinar
          </button>
        </Link>
      </div>

      {webinars.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
            <p className="text-3xl font-black text-[#1A1A2E]">{webinars.length}</p>
          </div>
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">En Vivo</p>
            <p className="text-3xl font-black text-green-500">{enVivo}</p>
          </div>
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Programados</p>
            <p className="text-3xl font-black text-[#5A4FCF]">{programados}</p>
          </div>
        </div>
      )}

      {webinars.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-gray-200">
          <Video className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-gray-400 font-bold mb-4">No hay webinars creados.</p>
          <Link href="/dashboard/webinars/create">
            <span className="text-[#5A4FCF] font-bold hover:underline text-sm">Crear el primer webinar</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {webinars.map((webinar) => {
            const cfg = STATUS_CONFIG[webinar.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.SCHEDULED;
            return (
              <div key={webinar.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${cfg.class}`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">{webinar.instructor.name}</span>
                </div>

                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2 leading-snug">{webinar.title}</h3>

                {webinar.description && (
                  <p className="text-sm text-gray-400 font-medium mb-4 line-clamp-2">{webinar.description}</p>
                )}

                <div className="flex items-center gap-4 mb-6">
                  {webinar.scheduledAt && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                      <Calendar size={13} className="text-[#5A4FCF]" />
                      {new Date(webinar.scheduledAt).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  )}
                  {webinar.maxParticipants && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                      <Users size={13} className="text-[#5A4FCF]" />
                      Máx. {webinar.maxParticipants}
                    </div>
                  )}
                </div>

                <WebinarActions id={webinar.id} status={webinar.status as "SCHEDULED" | "LIVE" | "ENDED"} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
