import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Radio, Plus, Calendar } from "lucide-react";
import LiveActions from "./LiveActions";

const STATUS_CONFIG = {
  SCHEDULED: {
    label: "Programado",
    class: "bg-amber-50 text-[#C9A84C]",
    dot: "bg-indigo-400",
  },
  LIVE: {
    label: "En Vivo",
    class: "bg-green-50 text-green-600",
    dot: "bg-green-500 animate-pulse",
  },
  ENDED: {
    label: "Finalizado",
    class: "bg-gray-100 text-gray-400",
    dot: "bg-gray-300",
  },
};

export default async function LivesDashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");
  const role = (session.user as any).role as string;
  if (!["ADMIN", "MENTOR"].includes(role)) redirect("/dashboard");

  const where = role === "ADMIN" ? {} : { instructorId: session.user.id as string };

  const lives = await prisma.liveStream.findMany({
    where,
    include: { instructor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  const enVivo = lives.filter((l) => l.status === "LIVE").length;
  const programados = lives.filter((l) => l.status === "SCHEDULED").length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-[#0B1F3A]">Gestionar Lives</h1>
          <p className="text-gray-400 font-medium">
            Crea y administra tus transmisiones en vivo.
          </p>
        </div>
        <Link href="/dashboard/lives/create">
          <button className="bg-[#C9A84C] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#B89640] transition-all shadow-lg shadow-amber-100">
            <Plus size={20} /> Nuevo Live
          </button>
        </Link>
      </div>

      {lives.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
            <p className="text-3xl font-black text-[#0B1F3A]">{lives.length}</p>
          </div>
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">En Vivo</p>
            <p className="text-3xl font-black text-green-500">{enVivo}</p>
          </div>
          <div className="bg-white rounded-[2rem] p-5 border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Programados</p>
            <p className="text-3xl font-black text-[#C9A84C]">{programados}</p>
          </div>
        </div>
      )}

      {lives.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-gray-200">
          <Radio className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-gray-400 font-bold mb-4">No hay transmisiones creadas.</p>
          <Link href="/dashboard/lives/create">
            <span className="text-[#C9A84C] font-bold hover:underline text-sm">
              Crear la primera transmisión
            </span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lives.map((live) => {
            const cfg = STATUS_CONFIG[live.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.SCHEDULED;
            return (
              <div
                key={live.id}
                className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${cfg.class}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  {role === "ADMIN" && (
                    <span className="text-[10px] text-gray-400 font-bold">
                      {live.instructor.name}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-[#0B1F3A] mb-2 leading-snug">
                  {live.title}
                </h3>

                {live.description && (
                  <p className="text-sm text-gray-400 font-medium mb-4 line-clamp-2">
                    {live.description}
                  </p>
                )}

                {live.scheduledAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-6">
                    <Calendar size={14} className="text-[#C9A84C]" />
                    {new Date(live.scheduledAt).toLocaleString("es-ES", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                )}

                <LiveActions id={live.id} status={live.status as "SCHEDULED" | "LIVE" | "ENDED"} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
