import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Video, Users, Clock, FileText, Globe, MapPin, Calendar, Sparkles, BookOpen } from "lucide-react";
import CourseActions from "./CourseActions";
import { parseWorkshopDetails } from "@/lib/utils/workshop";

function StatusBadge({ status, publishedAt }: { status: string; publishedAt: Date | null }) {
  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md">
        <FileText size={9} /> Borrador
      </span>
    );
  }
  if (status === "SCHEDULED") {
    const date = publishedAt ? new Date(publishedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "";
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-accent-subtle text-accent border border-accent/20 px-2 py-0.5 rounded-md">
        <Clock size={9} /> Prog. {date}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-md">
      <Globe size={9} /> Publicado
    </span>
  );
}

export default async function CursosDashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  if (session.user.role !== "ADMIN") {
    return null;
  }

  const cursos = await prisma.curso.findMany({
    include: {
      instructor: true,
      _count: { select: { inscritos: true, courseModules: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Cursos Online & Workshops</h1>
          <p className="text-muted font-medium text-sm mt-1">
            Gestiona tus programas educativos: cursos online por módulos y talleres presenciales con logística.
          </p>
        </div>
        <Link
          href="/dashboard/cursos/create"
          className="bg-accent-solid text-white px-5 py-2.5 rounded-xl inline-flex items-center gap-2 font-bold shadow-md hover:bg-accent-solid-hover transition-colors text-xs uppercase tracking-wider"
        >
          <PlusCircle size={16} />
          Crear Formación
        </Link>
      </div>

      {cursos.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center border border-card-border shadow-sm flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-accent-subtle rounded-2xl flex items-center justify-center mb-4">
            <BookOpen className="text-accent" size={28} />
          </div>
          <h3 className="text-xl font-bold text-foreground">No tienes cursos o workshops creados</h3>
          <p className="text-muted mt-2 mb-6 text-sm max-w-md">
            Comienza publicando tu primer curso online con módulos o tu próximo taller presencial.
          </p>
          <Link
            href="/dashboard/cursos/create"
            className="bg-accent-solid text-white px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold shadow-md hover:bg-accent-solid-hover transition-colors"
          >
            Publicar Ahora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {cursos.map((c) => {
            const workshop = parseWorkshopDetails(c.content, c.isLive, c.title);
            const isWorkshop = workshop.isWorkshop;

            return (
              <div key={c.id} className="relative bg-card rounded-2xl border border-card-border p-5 flex flex-col hover:shadow-lg transition h-full group">
                <CourseActions courseId={c.id} hasEnrolled={c._count.inscritos > 0} />
                
                <Link href={`/dashboard/cursos/${c.id}`} className="block">
                  {c.image ? (
                    <div className="relative w-full aspect-square bg-card-hover rounded-xl mb-4 overflow-hidden">
                      {c.image.startsWith("data:") ? (
                        <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <Image src={c.image} alt={c.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-square bg-accent-subtle rounded-xl mb-4 flex items-center justify-center">
                      <Video className="text-accent/40" size={28} />
                    </div>
                  )}
                </Link>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                      isWorkshop
                        ? "bg-accent-solid text-white"
                        : "bg-accent-subtle text-accent border border-accent/20"
                    }`}>
                      {isWorkshop ? "Workshop Presencial" : "Curso Online"}
                    </span>
                    <StatusBadge status={c.status} publishedAt={c.publishedAt} />
                  </div>

                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Link href={`/dashboard/cursos/${c.id}`}>
                      <h3 className="font-bold text-foreground leading-tight line-clamp-2 hover:text-accent transition-colors">
                        {c.title}
                      </h3>
                    </Link>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2.5 py-0.5 rounded-md text-xs whitespace-nowrap">
                      ${c.price}
                    </span>
                  </div>

                  {isWorkshop ? (
                    <div className="bg-section-alt p-3 rounded-xl space-y-1.5 text-xs text-muted mb-4 border border-card-border/50">
                      <div className="flex items-center gap-1.5 text-foreground font-semibold">
                        <MapPin size={13} className="text-accent shrink-0" />
                        <span className="truncate">{workshop.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-accent" />
                          {workshop.workshopDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-accent" />
                          {workshop.workshopTime}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted mb-4 line-clamp-2 flex-1">{c.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted bg-section-alt p-3 rounded-xl mt-auto">
                    <div className="flex items-center gap-1.5 flex-1">
                      <BookOpen size={14} className="text-accent" />
                      <span className="font-bold text-foreground">{c._count.courseModules}</span>
                      <span>Módulos cargados</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-accent" />
                      <span className="font-bold text-foreground">{c._count.inscritos}</span>
                      <span>Alumnos</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-card-border flex items-center justify-between">
                  <Link
                    href={`/dashboard/cursos/${c.id}`}
                    className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                  >
                    Ver Módulos ({c._count.courseModules}) →
                  </Link>

                  {c.status === "PUBLISHED" && (
                    <Link
                      href={`/cursos/${c.id}`}
                      target="_blank"
                      className="text-[11px] text-muted hover:text-foreground font-medium"
                    >
                      Página Pública
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
