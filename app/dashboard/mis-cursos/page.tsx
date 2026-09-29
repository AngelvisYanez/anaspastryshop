import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Clock, PlayCircle, BookOpen, ArrowRight, MapPin, Calendar, Sparkles } from "lucide-react";
import { parseWorkshopDetails } from "@/lib/utils/workshop";

export const metadata = {
  title: "Mis Cursos Online & Workshops | Panel",
};

export default async function MisCursosPage() {
  const session = await auth();

  if (!session?.user) redirect("/iniciar-sesion");
  // @ts-ignore
  if (session.user.role !== "USER") redirect("/dashboard");

  const [approvedInscriptions, purchases] = await Promise.all([
    prisma.inscription.findMany({
      where: {
        userId: session.user.id,
        status: "APPROVED",
        NOT: { cursoId: null },
      },
      include: {
        curso: {
          include: {
            instructor: { select: { name: true } },
            _count: { select: { courseModules: true } },
          },
        },
      },
    }),
    prisma.coursePurchase.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      include: {
        curso: {
          include: {
            instructor: { select: { name: true } },
            _count: { select: { courseModules: true } },
          },
        },
      },
    }),
  ]);

  const courseMap = new Map<string, any>();
  for (const p of purchases) {
    if (p.curso) courseMap.set(p.cursoId, p.curso);
  }
  for (const i of approvedInscriptions) {
    if (i.curso && i.cursoId) courseMap.set(i.cursoId, i.curso);
  }
  const courses = Array.from(courseMap.values());

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Mis Cursos & Workshops</h2>
          <p className="text-muted font-medium text-sm mt-1">
            Acceso permanente a tus formaciones. Entra para ver módulos y clases.
          </p>
        </div>
        <Link
          href="/cursos"
          className="bg-accent-solid text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent-solid-hover transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto min-h-11"
        >
          Explorar Más <ArrowRight size={14} />
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-card border border-card-border rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 bg-accent-subtle rounded-2xl flex items-center justify-center mx-auto mb-4 text-accent">
            <BookOpen size={32} />
          </div>
          <h3 className="text-lg font-black text-foreground mb-1">Aún no te has inscrito en ninguna formación</h3>
          <p className="text-sm text-muted font-medium mb-6">
            Adquiere cursos online con módulos en video o reserva tu cupo para nuestros workshops presenciales.
          </p>
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 bg-accent-solid text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-accent-solid-hover transition-colors shadow-md"
          >
            Ver Catálogo Completo <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((curso) => {
            const workshop = parseWorkshopDetails(curso.content, curso.isLive, curso.title);
            const isWorkshop = workshop.isWorkshop;

            return (
              <Link key={curso.id} href={`/dashboard/cursos/${curso.id}`}>
                <div className="bg-card border border-card-border rounded-2xl overflow-hidden hover:shadow-lg hover:border-accent/30 transition group flex flex-col h-full">
                  {curso.image ? (
                    <div className="relative w-full aspect-square bg-section-alt overflow-hidden">
                      <Image
                        src={curso.image}
                        alt={curso.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm ${
                          isWorkshop
                            ? "bg-accent-solid text-white shadow-sm"
                            : "bg-black/70 text-white border border-white/20"
                        }`}>
                          {isWorkshop ? "Workshop Presencial" : "Curso Online"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-section-alt flex items-center justify-center">
                      <PlayCircle size={36} className="text-muted/30" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-foreground mb-1 leading-snug line-clamp-2">
                      {curso.title}
                    </h3>
                    <p className="text-xs text-muted font-medium mb-3">
                      Por {curso.instructor?.name || "Anais Flores"}
                    </p>

                    {isWorkshop ? (
                      <div className="bg-section-alt p-3 rounded-xl space-y-1 text-xs text-muted mb-4 border border-card-border/50">
                        <div className="flex items-center gap-1.5 text-foreground font-semibold truncate">
                          <MapPin size={12} className="text-accent shrink-0" />
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
                      <div className="flex items-center gap-4 text-xs text-muted font-medium mb-4 bg-section-alt p-2.5 rounded-xl">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-accent" />
                          {curso.totalHours}h
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} className="text-accent" />
                          {curso._count.courseModules} módulos cargados
                        </span>
                      </div>
                    )}

                    <div className="mt-auto pt-3 border-t border-card-border flex items-center justify-between">
                      <span className="text-xs font-bold text-accent group-hover:underline flex items-center gap-1">
                        {isWorkshop ? "Ver Detalles del Taller" : "Entrar y Ver Módulos"} →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
