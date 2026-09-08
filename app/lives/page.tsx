import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { Radio, Calendar, Clock, Lock } from "lucide-react";
import Link from "next/link";
import { cacheLife, cacheTag } from "next/cache";

export const metadata = {
  title: "Lives y Clases en Vivo | Ana's Pastry Shop",
  description: "Accede a transmisiones en vivo, demostraciones de recetas y clases interactivas con la Chef Anais Flores.",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        En Vivo Ahora
      </span>
    );
  }
  if (status === "SCHEDULED") {
    return (
      <span className="inline-flex items-center gap-2 bg-pink-50 dark:bg-pink-950/30 text-accent text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-pink-200 dark:border-pink-900/50">
        <Clock size={10} />
        Próximamente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 bg-section-alt text-muted text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-card-border">
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

      <div className="relative overflow-hidden bg-gradient-to-b from-[#25072F] via-[#350A43] to-[#1C0425] pt-32 pb-20 px-8 md:px-20 rounded-b-3xl mb-16 text-center">
        <div className="absolute inset-0 opacity-[0.025] noise-bg pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-accent/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[0%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
          <h1 className="font-display text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-none">
            Lives &amp; <br />
            <span className="text-accent italic">Masterclasses en Vivo</span>
          </h1>
          <p className="text-lg text-white/75 max-w-xl mx-auto font-medium">
            Aprende en tiempo real directamente con la Chef Anais Flores. Aprende en tiempo real directamente con la Chef Anais Flores.
          </p>
        </div>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
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
                  className="relative bg-[#25072F] rounded-2xl p-8 border border-white/10 overflow-hidden shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[80px] rounded-full pointer-events-none" />
                  <div className="relative z-10">
                    <StatusBadge status="LIVE" />
                    <h3 className="text-2xl font-black text-white mt-4 mb-2 leading-snug">
                      {live.title}
                    </h3>
                    {live.description && (
                      <p className="text-white/85 text-sm font-medium mb-4 line-clamp-2">
                        {live.description}
                      </p>
                    )}
                    <p className="text-xs text-pink-300 font-bold mb-6">
                      Con {live.instructor.name}
                    </p>
                    <Link href={`/lives/${live.id}`}>
                      <button className="w-full bg-accent text-white py-4 rounded-2xl font-bold text-sm hover:bg-accent-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30">
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
                  className="bg-card rounded-2xl p-8 border border-card-border shadow-sm hover:shadow-lg transition-all group"
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
                     <Clock size={12} className="text-accent" /> Sesión próxima
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
              Pronto anunciaremos nuevas masterclasses en vivo con la Chef Anais Flores. Mantente atento.
            </p>
          </div>
        )}

        <div className="bg-gradient-to-b from-[#25072F] via-[#350A43] to-[#1C0425] rounded-2xl p-12 text-white text-center relative overflow-hidden border border-card-border">
          <div className="absolute inset-0 bg-accent/15 blur-[100px]" />
          <div className="relative z-10">
            <Radio className="mx-auto mb-4 text-accent" size={36} />
            <h3 className="font-display text-2xl md:text-3xl font-black mb-3">
              ¿Quieres acceder a todos los lives?
            </h3>
            <p className="text-white/90 mb-8 font-medium max-w-md mx-auto">
Regístrate o inicia sesión para acceder a masterclasses en vivo y resolver tus dudas de pastelería en tiempo real.
              </p>
              <Link href="/registro">
                <button className="bg-accent text-white px-10 py-4 rounded-2xl font-bold hover:bg-accent-hover transition-all shadow-xl shadow-pink-600/30 uppercase tracking-wider text-xs">
                  Registrarse
                </button>
              </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
