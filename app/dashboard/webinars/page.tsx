import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Video, Plus, Calendar, Users } from "lucide-react";
import WebinarActions from "./WebinarActions";

const STATUS_CONFIG = {
  SCHEDULED: { label: "Programado", class: "bg-amber-50 dark:bg-amber-950/20 text-accent", dot: "bg-indigo-400" },
  LIVE: { label: "En Vivo", class: "bg-green-50 dark:bg-green-950/20 text-green-600", dot: "bg-green-500 animate-pulse" },
  ENDED: { label: "Finalizado", class: "bg-section-alt text-muted", dot: "bg-muted/40" },
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
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Webinars & Meetings</h1>
          <p className="text-muted font-medium">Gestiona tus sesiones en tiempo real con RealtimeKit.</p>
        </div>
        <Link href="/dashboard/webinars/create">
          <button className="bg-accent text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-accent-hover transition-all shadow-md">
            <Plus size={18} /> Nuevo Webinar
          </button>
        </Link>
      </div>

      {webinars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-lg p-5 border border-card-border shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Total</p>
            <p className="text-3xl font-black text-foreground">{webinars.length}</p>
          </div>
          <div className="bg-card rounded-lg p-5 border border-card-border shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">En Vivo</p>
            <p className="text-3xl font-black text-green-500">{enVivo}</p>
          </div>
          <div className="bg-card rounded-lg p-5 border border-card-border shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Programados</p>
            <p className="text-3xl font-black text-accent">{programados}</p>
          </div>
        </div>
      )}

      {webinars.length === 0 ? (
        <div className="bg-card rounded-xl p-16 text-center border border-dashed border-card-border">
          <Video className="mx-auto text-muted/20 mb-4" size={40} />
          <p className="text-muted font-bold mb-4">No hay webinars creados.</p>
          <Link href="/dashboard/webinars/create">
            <span className="text-accent font-bold hover:underline text-sm">Crear el primer webinar</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {webinars.map((webinar) => {
            const cfg = STATUS_CONFIG[webinar.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.SCHEDULED;
            return (
              <div key={webinar.id} className="bg-card rounded-xl p-6 border border-card-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-md ${cfg.class}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <span className="text-[10px] text-muted font-bold">{webinar.instructor.name}</span>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2 leading-snug">{webinar.title}</h3>

                {webinar.description && (
                  <p className="text-sm text-muted font-medium mb-4 line-clamp-2">{webinar.description}</p>
                )}

                <div className="flex items-center gap-4 mb-5">
                  {webinar.scheduledAt && (
                    <div className="flex items-center gap-1.5 text-sm text-muted font-medium">
                      <Calendar size={13} className="text-accent" />
                      {new Date(webinar.scheduledAt).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                  )}
                  {webinar.maxParticipants && (
                    <div className="flex items-center gap-1.5 text-sm text-muted font-medium">
                      <Users size={13} className="text-accent" />
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
