import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Video, Calendar, Users, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Webinars y Masterclasses | Ana's Pastry Shop",
  description: "Participa en webinars interactivos y talleres en vivo de pastelería y repostería con la Chef Anais Flores.",
};

function WebinarCard({
  webinar,
  hasAccess,
  isLive,
}: {
  webinar: any;
  hasAccess: boolean;
  isLive: boolean;
}) {
  return (
    <div className="bg-card rounded-2xl border border-card-border overflow-hidden hover:shadow-lg transition-all flex flex-col group">
      <div className="relative aspect-video bg-section-alt overflow-hidden">
        {webinar.coverImage ? (
          <img
            src={webinar.coverImage}
            alt={webinar.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted/40">
            <Video size={40} />
          </div>
        )}
        {isLive && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-red-500 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> En Vivo
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-foreground text-base leading-snug mb-2">{webinar.title}</h3>

        {webinar.description && (
          <p className="text-sm text-muted font-medium line-clamp-2 mb-3">{webinar.description}</p>
        )}

        <div className="mt-auto space-y-2">
          {webinar.instructor.name && (
            <p className="text-xs text-muted font-medium">Instructor: {webinar.instructor.name}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted font-medium">
            {webinar.scheduledAt && (
              <span suppressHydrationWarning className="flex items-center gap-1">
                <Calendar size={11} className="text-accent" />
                {new Date(webinar.scheduledAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
              </span>
            )}
            {webinar.maxParticipants && (
              <span className="flex items-center gap-1">
                <Users size={11} className="text-accent" /> Máx. {webinar.maxParticipants}
              </span>
            )}
          </div>

            {hasAccess && isLive ? (
            <Link href={`/webinars/${webinar.id}`} className="block mt-3">
              <button className="w-full bg-accent text-white py-3 rounded-2xl font-bold text-sm hover:bg-accent-hover transition-all flex items-center justify-center gap-2 shadow-md shadow-pink-600/25">
                Entrar ahora <ArrowRight size={15} />
              </button>
            </Link>
          ) : hasAccess ? (
            <button disabled className="w-full bg-section-alt text-muted py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
              Próximamente
            </button>
          ) : (
            <Link href="/registro" className="block mt-3">
              <button className="w-full bg-accent text-white py-3 rounded-2xl font-bold text-sm hover:bg-accent-hover transition-all flex items-center justify-center gap-2 shadow-md shadow-pink-600/25">
                Regístrate para unirte <ArrowRight size={15} />
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

async function WebinarsContent() {
  const session = await auth();

  const hasAccess = !!session?.user;

  const webinars = await prisma.webinar.findMany({
    where: { status: { in: ["LIVE", "SCHEDULED"] } },
    include: { instructor: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { scheduledAt: "asc" }],
  });

  const live = webinars.filter((w) => w.status === "LIVE");
  const scheduled = webinars.filter((w) => w.status === "SCHEDULED");

  return (
    <main id="main-content" className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="relative overflow-hidden bg-gradient-to-b from-[#25072F] via-[#350A43] to-[#1C0425] pt-32 pb-20 px-8 md:px-20 rounded-b-3xl mb-16 text-center">
        <div className="absolute inset-0 opacity-[0.025] noise-bg pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-accent/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[0%] w-[30%] h-[30%] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
          <h1 className="font-display text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-none">
            Webinars &amp; <br />
            <span className="text-accent italic">Masterclasses</span>
          </h1>
          <p className="text-lg text-white/75 max-w-xl mx-auto font-medium">
            Sesiones interactivas con la Chef Anais Flores. Aprende recetas de vitrina, técnicas y secretos en vivo.
          </p>
        </div>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
        {!hasAccess && (
          <div className="bg-gradient-to-r from-accent to-[#B81268] rounded-2xl p-8 mb-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-pink-600/20">
            <div>
              <p className="font-black text-xl mb-1">Webinars exclusivos</p>
              <p className="text-white/85 font-medium text-sm max-w-xl">
                {session?.user
                  ? "Inicia sesión para acceder a los webinars en tiempo real."
                  : "Crea una cuenta o inicia sesión para acceder a los webinars y masterclasses en vivo."}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {!session?.user && (
                <Link href="/registro">
                  <button className="bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-white/30 transition-all whitespace-nowrap">
                    Registrarse
                  </button>
                </Link>
              )}
              {session?.user && (
                <Link href="/dashboard">
                  <button className="bg-white text-accent px-6 py-3 rounded-2xl font-black text-sm hover:bg-pink-50 transition-all flex items-center gap-2 whitespace-nowrap shadow-md">
                    Ver Webinars <ArrowRight size={16} />
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}

        {webinars.length === 0 ? (
          <div className="bg-card rounded-2xl p-16 text-center border border-dashed border-card-border">
            <Video className="mx-auto text-muted/30 mb-4" size={48} />
            <p className="text-muted font-bold">No hay webinars programados en este momento.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {live.length > 0 && (
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-5 ml-1">En Vivo Ahora</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {live.map((w) => (
                    <WebinarCard key={w.id} webinar={w} hasAccess={hasAccess} isLive />
                  ))}
                </div>
              </div>
            )}

            {scheduled.length > 0 && (
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-5 ml-1">Próximas Sesiones</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {scheduled.map((w) => (
                    <WebinarCard key={w.id} webinar={w} hasAccess={hasAccess} isLive={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!hasAccess && webinars.length > 0 && (
          <div className="mt-16 bg-gradient-to-b from-[#25072F] via-[#350A43] to-[#1C0425] rounded-2xl p-12 text-white text-center relative overflow-hidden border border-card-border">
            <div className="absolute inset-0 bg-accent/15 blur-[100px] text-white" />
            <div className="relative z-10">
              <Video className="mx-auto mb-4 text-accent" size={36} />
              <h3 className="font-display text-2xl md:text-3xl font-black mb-3">¿Quieres acceder a todos los webinars?</h3>
              <p className="text-white/70 mb-8 font-medium max-w-md mx-auto">
                Regístrate en la plataforma y accede a todos nuestros webinars y masterclasses en vivo.
              </p>
              <Link href="/registro">
                <button className="bg-accent text-white px-10 py-4 rounded-2xl font-bold hover:bg-accent-hover transition-all shadow-xl shadow-pink-600/30 uppercase tracking-wider text-xs">
                  Registrarse
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

export default function WebinarsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <WebinarsContent />
    </Suspense>
  );
}
