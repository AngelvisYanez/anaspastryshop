import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Video, Calendar, Users, Lock, ArrowRight } from "lucide-react";

export default async function WebinarsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id as string;
  const role = (session.user as any).role as string;
  const isStaff = ["ADMIN", "MENTOR"].includes(role);

  let hasAccess = isStaff;

  if (!isStaff) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      select: { status: true, plan: true },
    });

    if (subscription?.status === "ACTIVE") {
      const plan = await prisma.subscriptionPlan.findFirst({
        where: { slug: subscription.plan, isActive: true },
        select: { hasWebinarAccess: true },
      });
      hasAccess = plan?.hasWebinarAccess ?? false;
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
    <main className="min-h-screen bg-[#F4F4F7] pt-32 pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-[#5A4FCF] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100">
            <Video size={12} /> Sesiones en Tiempo Real
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#1A1A2E] tracking-tighter mb-6 leading-none">
            Webinars &<br />
            <span className="text-[#5A4FCF] italic">Meetings</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto font-medium">
            Sesiones en tiempo real con instructores expertos. Aprende, pregunta y participa en vivo.
          </p>
        </div>

        {!hasAccess && (
          <div className="bg-gradient-to-r from-[#5A4FCF] to-[#483dbb] rounded-[2.5rem] p-8 mb-10 text-white flex items-center justify-between">
            <div>
              <p className="font-black text-xl mb-1">Acceso Premium requerido</p>
              <p className="text-indigo-200 font-medium">Tu plan actual no incluye webinars en tiempo real.</p>
            </div>
            <Link href="/planes">
              <button className="bg-white text-[#5A4FCF] px-6 py-3 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center gap-2 whitespace-nowrap">
                Ver planes <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        )}

        {webinars.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-dashed border-gray-200">
            <Video className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 font-bold">No hay webinars disponibles en este momento.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {live.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5 ml-1">En Vivo Ahora</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {live.map((w) => (
                    <WebinarCard key={w.id} webinar={w} hasAccess={hasAccess} isLive />
                  ))}
                </div>
              </div>
            )}

            {scheduled.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5 ml-1">Próximas Sesiones</p>
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
          <div className="mt-16 bg-[#1A1A2E] rounded-[3rem] p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#5A4FCF]/10 blur-[100px]" />
            <div className="relative z-10">
              <Video className="mx-auto mb-4 text-[#5A4FCF]" size={36} />
              <h3 className="text-2xl md:text-3xl font-black mb-3">¿Quieres acceder a todos los webinars?</h3>
              <p className="text-gray-400 mb-8 font-medium">
                Suscríbete al plan que incluye webinars en vivo y aprende con expertos en tiempo real.
              </p>
              <Link href="/planes">
                <button className="bg-[#5A4FCF] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#483dbb] transition-all shadow-xl shadow-indigo-900/30">
                  Ver Planes de Suscripción
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
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {webinar.thumbnail ? (
        <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${webinar.thumbnail})` }} />
      ) : (
        <div className="h-40 bg-gradient-to-br from-[#5A4FCF]/10 to-[#5A4FCF]/5 flex items-center justify-center">
          <Video size={32} className="text-[#5A4FCF]/30" />
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-green-50 text-green-600">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En Vivo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-indigo-50 text-[#5A4FCF]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Programado
            </span>
          )}
        </div>

        <h3 className="font-bold text-[#1A1A2E] text-base leading-snug mb-2">{webinar.title}</h3>

        {webinar.description && (
          <p className="text-sm text-gray-400 font-medium line-clamp-2 mb-3">{webinar.description}</p>
        )}

        <div className="mt-auto space-y-2">
          {webinar.instructor.name && (
            <p className="text-xs text-gray-400 font-medium">Instructor: {webinar.instructor.name}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
            {webinar.scheduledAt && (
              <span className="flex items-center gap-1">
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
              <button className="w-full bg-[#5A4FCF] text-white py-3 rounded-2xl font-bold text-sm hover:bg-[#483dbb] transition-all flex items-center justify-center gap-2">
                Entrar ahora <ArrowRight size={15} />
              </button>
            </Link>
          ) : hasAccess && !isLive ? (
            <div className="mt-3 w-full bg-gray-50 text-gray-400 py-3 rounded-2xl font-bold text-sm text-center">
              Próximamente
            </div>
          ) : (
            <Link href="/planes" className="block mt-3">
              <button className="w-full bg-gray-50 text-gray-500 py-3 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                <Lock size={13} /> Requiere plan
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
