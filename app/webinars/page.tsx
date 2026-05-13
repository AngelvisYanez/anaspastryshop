import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Video, Calendar, Users, Lock, ArrowRight } from "lucide-react";
import { isSubscriptionValid } from "@/lib/utils/subscription";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webinars en Vivo",
  description:
    "Sesiones interactivas en tiempo real con expertos en crédito y finanzas. Haz preguntas y aprende directamente con instructores certificados.",
  robots: { index: false, follow: false },
};

function WebinarCard({
  webinar,
  hasAccess,
  isLive,
}: {
  webinar: { id: string; title: string; description: string | null; thumbnail: string | null; scheduledAt: Date | null; maxParticipants: number | null; instructor: { name: string | null } };
  hasAccess: boolean;
  isLive: boolean;
}) {
  return (
    <div className="bg-card rounded-xl border border-card-border shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {webinar.thumbnail ? (
        <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${webinar.thumbnail})` }} />
      ) : (
        <div className="h-40 bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
          <Video size={32} className="text-accent/30" />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-green-50 text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En Vivo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-accent-subtle text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60" /> Programado
            </span>
          )}
        </div>

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
                <Calendar size={11} />
                {new Date(webinar.scheduledAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
              </span>
            )}
            {webinar.maxParticipants && (
              <span className="flex items-center gap-1">
                <Users size={11} /> Máx. {webinar.maxParticipants}
              </span>
            )}
          </div>

          {hasAccess && isLive ? (
            <Link href={`/webinars/${webinar.id}`} className="block mt-3">
              <button className="w-full bg-accent text-[#0B1F3A] py-3 rounded-2xl font-bold text-sm hover:bg-accent-hover transition-all flex items-center justify-center gap-2">
                Entrar ahora <ArrowRight size={15} />
              </button>
            </Link>
          ) : hasAccess && !isLive ? (
            <div className="mt-3 w-full bg-section-alt text-muted py-3 rounded-2xl font-bold text-sm text-center border border-card-border">
              Próximamente
            </div>
          ) : (
            <Link href="/membresia" className="block mt-3">
              <button className="w-full bg-section-alt text-muted py-3 rounded-2xl font-bold text-sm hover:bg-card-border transition-all flex items-center justify-center gap-2 border border-card-border">
                <Lock size={13} /> Requiere plan
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

  let hasAccess = false;

  if (session?.user) {
    const userId = session.user.id as string;
    const role = (session.user as any).role as string;
    const isStaff = ["ADMIN", "MENTOR"].includes(role);

    if (isStaff) {
      hasAccess = true;
    } else {
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
        select: { status: true, plan: true, endDate: true },
      });

      if (subscription && isSubscriptionValid(subscription)) {
        const plan = await prisma.subscriptionPlan.findFirst({
          where: { slug: subscription.plan, isActive: true },
          select: { hasWebinarAccess: true },
        });
        hasAccess = plan?.hasWebinarAccess ?? false;
      }
    }
  }

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

      <div className="relative overflow-hidden bg-[#0B1F3A] pt-32 pb-20 px-8 md:px-20 rounded-b-3xl mb-16 text-center">
        <div className="absolute inset-0 opacity-[0.025] noise-bg pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[0%] w-[30%] h-[30%] bg-accent/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.1] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 text-accent">
            <Video size={12} /> Sesiones en Tiempo Real
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-none">
            Webinars &<br />
            <span className="text-accent italic">Meetings</span>
          </h1>
          <p className="text-lg text-white/55 max-w-xl mx-auto font-medium">
            Sesiones en tiempo real con instructores expertos. Aprende, pregunta y participa en vivo.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {!hasAccess && (
          <div className="bg-gradient-to-r from-[#C9A84C] to-[#B89640] rounded-xl p-8 mb-10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-black text-xl mb-1">Membresía requerida</p>
              <p className="text-white/70 font-medium">
                {session?.user
                  ? "Tu plan actual no incluye webinars en tiempo real."
                  : "Crea una cuenta o inicia sesión para acceder a los webinars en vivo."}
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
              <Link href="/pagar/membresia">
                <button className="bg-white text-[#C9A84C] px-6 py-3 rounded-2xl font-bold text-sm hover:bg-amber-50 transition-all flex items-center gap-2 whitespace-nowrap">
                  Ver membresía <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        )}

        {webinars.length === 0 ? (
          <div className="bg-card rounded-2xl p-16 text-center border border-dashed border-card-border">
            <Video className="mx-auto text-muted/30 mb-4" size={48} />
            <p className="text-muted font-bold">No hay webinars disponibles en este momento.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {live.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-5 ml-1">En Vivo Ahora</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {live.map((w) => (
                    <WebinarCard key={w.id} webinar={w} hasAccess={hasAccess} isLive />
                  ))}
                </div>
              </div>
            )}

            {scheduled.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-5 ml-1">Próximas Sesiones</p>
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
          <div className="mt-16 bg-[#0B1F3A] rounded-2xl p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-accent/10 blur-[100px]" />
            <div className="relative z-10">
              <Video className="mx-auto mb-4 text-accent" size={36} />
              <h3 className="text-2xl md:text-3xl font-black mb-3">¿Quieres acceder a todos los webinars?</h3>
              <p className="text-white/55 mb-8 font-medium">
                Suscríbete al plan que incluye webinars en vivo y aprende con expertos en tiempo real.
              </p>
              <Link href="/membresia">
                <button className="bg-accent text-[#0B1F3A] px-10 py-4 rounded-2xl font-bold hover:bg-accent-hover transition-all shadow-xl shadow-accent/25">
                  Ver Membresía
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
