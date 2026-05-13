import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Radio, Calendar, Clock, Lock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lives y Clases en Vivo",
  description:
    "Transmisiones en vivo con instructores expertos en crédito y finanzas. Aprende en tiempo real con Academia Credito USA.",
  openGraph: {
    title: "Lives y Clases en Vivo | Academia Credito USA",
    description: "Clases en vivo sobre crédito y finanzas para la comunidad hispana en USA.",
  },
};

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

async function getLives() {
  "use cache";
  cacheLife("minutes");
  cacheTag("lives");
  return prisma.liveStream.findMany({
    where: { status: { in: ["LIVE", "SCHEDULED"] } },
    include: { instructor: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { scheduledAt: "asc" }, { createdAt: "desc" }],
  });
}

export default async function LivesPage() {
  const lives = await getLives();

  const liveNow = lives.filter((l) => l.status === "LIVE");
  const scheduled = lives.filter((l) => l.status === "SCHEDULED");

  return (
    <main id="main-content" className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="relative overflow-hidden bg-[#0B1F3A] pt-32 pb-20 px-8 md:px-20 rounded-b-3xl mb-16 text-center">
        <div className="absolute inset-0 opacity-[0.025] noise-bg pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[0%] w-[30%] h-[30%] bg-accent/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.1] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 text-accent">
            <Radio size={12} /> Transmisiones en Vivo
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-none">
            Lives &amp; <br />
            <span className="text-accent italic">Clases en Vivo</span>
          </h1>
          <p className="text-lg text-white/55 max-w-xl mx-auto font-medium">
            Aprende en tiempo real con nuestros instructores. Accede con tu suscripción activa.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {liveNow.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-xl font-black text-foreground uppercase tracking-wider">
                En Vivo Ahora
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveNow.map((live) => (
                <div
                  key={live.id}
                  className="relative bg-[#0B1F3A] rounded-xl p-8 border border-white/10 overflow-hidden"
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
            <h2 className="text-xl font-black text-foreground uppercase tracking-wider mb-6">
              Próximas Transmisiones
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduled.map((live) => (
                <div
                  key={live.id}
                  className="bg-card rounded-xl p-8 border border-card-border shadow-sm hover:shadow-lg transition-all group"
                >
                  <StatusBadge status="SCHEDULED" />
                  <h3 className="text-xl font-black text-foreground mt-4 mb-2 leading-snug group-hover:text-accent transition-colors">
                    {live.title}
                  </h3>
                  {live.description && (
                    <p className="text-muted text-sm font-medium mb-4 line-clamp-2">
                      {live.description}
                    </p>
                  )}
                  <p className="text-xs text-muted font-bold mb-3">
                    Con {live.instructor.name}
                  </p>
                  {live.scheduledAt && (
                    <div suppressHydrationWarning className="flex items-center gap-2 text-xs text-muted font-medium mb-6">
                      <Calendar size={13} className="text-accent" />
                      {new Date(live.scheduledAt).toLocaleString("es-ES", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted font-bold bg-section-alt p-3 rounded-xl border border-card-border">
                    <Lock size={12} /> Requiere suscripción activa
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {lives.length === 0 && (
          <div className="bg-card rounded-2xl p-20 text-center border border-dashed border-card-border">
            <Radio className="mx-auto text-muted/30 mb-4" size={56} />
            <h2 className="text-2xl font-black text-foreground mb-3">
              No hay transmisiones disponibles
            </h2>
            <p className="text-muted font-medium max-w-sm mx-auto">
              Pronto se publicarán nuevas clases en vivo. Mantente atento.
            </p>
          </div>
        )}

        <div className="bg-[#0B1F3A] rounded-2xl p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/10 blur-[100px]" />
          <div className="relative z-10">
            <Radio className="mx-auto mb-4 text-accent" size={36} />
            <h3 className="text-2xl md:text-3xl font-black mb-3">
              ¿Quieres acceder a todos los lives?
            </h3>
            <p className="text-white/55 mb-8 font-medium">
              Suscríbete al plan que incluye transmisiones en vivo y aprende en tiempo real.
            </p>
            <Link href="/membresia">
              <button className="bg-accent text-[#0B1F3A] px-10 py-4 rounded-2xl font-bold hover:bg-accent-hover transition-all shadow-xl shadow-accent/25">
                Ver Membresía
              </button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
