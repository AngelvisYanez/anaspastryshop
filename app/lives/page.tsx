import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Radio, Calendar, Clock, Lock } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-2 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-green-200">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        En Vivo Ahora
      </span>
    );
  }
  if (status === "SCHEDULED") {
    return (
      <span className="inline-flex items-center gap-2 bg-amber-50 text-[#C9A84C] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-amber-200">
        <Clock size={10} />
        Próximamente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
      Finalizado
    </span>
  );
}

export default async function LivesPage() {
  const lives = await prisma.liveStream.findMany({
    where: { status: { in: ["LIVE", "SCHEDULED"] } },
    include: { instructor: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { scheduledAt: "asc" }, { createdAt: "desc" }],
  });

  const liveNow = lives.filter((l) => l.status === "LIVE");
  const scheduled = lives.filter((l) => l.status === "SCHEDULED");

  return (
    <main className="min-h-screen bg-[#F8F4EE] pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-red-100">
            <Radio size={12} /> Transmisiones en Vivo
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#0B1F3A] tracking-tighter mb-6 leading-none">
            Lives & <br />
            <span className="text-[#C9A84C] italic">Clases en Vivo</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto font-medium">
            Aprende en tiempo real con nuestros instructores. Accede con tu suscripción activa.
          </p>
        </div>

        {liveNow.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-xl font-black text-[#0B1F3A] uppercase tracking-wider">
                En Vivo Ahora
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveNow.map((live) => (
                <div
                  key={live.id}
                  className="relative bg-[#0B1F3A] rounded-[2.5rem] p-8 border border-white/10 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A84C]/20 blur-[80px] rounded-full pointer-events-none" />
                  <div className="relative z-10">
                    <StatusBadge status="LIVE" />
                    <h3 className="text-2xl font-black text-white mt-4 mb-2 leading-snug">
                      {live.title}
                    </h3>
                    {live.description && (
                      <p className="text-gray-400 text-sm font-medium mb-4 line-clamp-2">
                        {live.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 font-bold mb-6">
                      Con {live.instructor.name}
                    </p>
                    <Link href={`/lives/${live.id}`}>
                      <button className="w-full bg-[#C9A84C] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#B89640] transition-all flex items-center justify-center gap-2">
                        <Radio size={16} /> Entrar al Live
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {scheduled.length > 0 && (
          <div className="mb-16">
            <h2 className="text-xl font-black text-[#0B1F3A] uppercase tracking-wider mb-6">
              Próximas Transmisiones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduled.map((live) => (
                <div
                  key={live.id}
                  className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
                >
                  <StatusBadge status="SCHEDULED" />
                  <h3 className="text-xl font-black text-[#0B1F3A] mt-4 mb-2 leading-snug group-hover:text-[#C9A84C] transition-colors">
                    {live.title}
                  </h3>
                  {live.description && (
                    <p className="text-gray-400 text-sm font-medium mb-4 line-clamp-2">
                      {live.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 font-bold mb-3">
                    Con {live.instructor.name}
                  </p>
                  {live.scheduledAt && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-6">
                      <Calendar size={13} className="text-[#C9A84C]" />
                      {new Date(live.scheduledAt).toLocaleString("es-ES", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-bold bg-gray-50 p-3 rounded-xl">
                    <Lock size={12} /> Requiere suscripción activa
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lives.length === 0 && (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
            <Radio className="mx-auto text-gray-200 mb-4" size={56} />
            <h2 className="text-2xl font-black text-[#0B1F3A] mb-3">
              No hay transmisiones disponibles
            </h2>
            <p className="text-gray-400 font-medium max-w-sm mx-auto">
              Pronto se publicarán nuevas clases en vivo. Mantente atento.
            </p>
          </div>
        )}

        <div className="bg-[#0B1F3A] rounded-[3rem] p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#C9A84C]/10 blur-[100px]" />
          <div className="relative z-10">
            <Radio className="mx-auto mb-4 text-[#C9A84C]" size={36} />
            <h3 className="text-2xl md:text-3xl font-black mb-3">
              ¿Quieres acceder a todos los lives?
            </h3>
            <p className="text-gray-400 mb-8 font-medium">
              Suscríbete al plan que incluye transmisiones en vivo y aprende en tiempo real.
            </p>
            <Link href="/planes">
              <button className="bg-[#C9A84C] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#B89640] transition-all shadow-xl shadow-indigo-900/30">
                Ver Planes de Suscripción
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
