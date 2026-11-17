"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PlayCircle,
  BookOpen,
  Clock,
  MapPin,
  Calendar,
  Sparkles,
  Video,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  publicWorkshopDateLabel,
  publicWorkshopTimeLabel,
  WORKSHOP_LOCATION,
  type WorkshopDetails,
} from "@/lib/utils/workshop";
import { getCourseEmbedUrl } from "@/app/cursos/[slug]/courseEmbed";

type Lesson = {
  id: string;
  title: string;
  duration: number;
  summary?: string | null;
};

type CourseModule = {
  id: string;
  title: string;
  duration?: number | null;
  lessons: Lesson[];
};

export function WorkshopLogisticsBanner({
  workshopInfo,
  instructorName,
}: {
  workshopInfo: WorkshopDetails;
  instructorName: string | null;
}) {
  const publicTime = publicWorkshopTimeLabel(
    workshopInfo.workshopDate,
    workshopInfo.workshopTime,
  );
  const location = workshopInfo.location || WORKSHOP_LOCATION;

  return (
    <div className="bg-gradient-to-br from-brand-purple via-brand-purple-deep to-brand-purple-deep border-2 border-accent/30 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="inline-flex items-center gap-2 bg-accent-solid text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
            <Sparkles size={13} /> Taller Presencial Confirmado
          </span>
          <span className="text-xs text-white/70 font-medium">
            Instructor: <strong className="text-white">{instructorName || "Anais Flores"}</strong>
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
          Logística & Detalles del Workshop
        </h2>
        <p className="text-white/70 text-sm max-w-2xl mb-6 leading-relaxed">
          Este taller se realiza en modalidad 100% presencial en nuestras instalaciones. Recuerda asistir puntual y con tus materiales requeridos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-pink-300 text-xs font-bold uppercase tracking-wider mb-1">
              <MapPin size={15} /> Ubicación
            </div>
            <p className="text-sm font-black text-white">
              {location}
            </p>
            <p className="text-[11px] text-white/60 mt-1">Punto de encuentro exclusivo</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-pink-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar size={15} /> Fecha
            </div>
            <p className="text-sm font-black text-white">
              {publicWorkshopDateLabel(workshopInfo.workshopDate)}
            </p>
            <p className="text-[11px] text-white/60 mt-1">Jornada intensiva programada</p>
          </div>

          {publicTime && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-pink-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock size={15} /> Horario
              </div>
              <p className="text-sm font-black text-white">{publicTime}</p>
              <p className="text-[11px] text-white/60 mt-1">Puntualidad requerida</p>
            </div>
          )}
        </div>
        <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <iframe
            title="Mapa de la ubicación del workshop"
            src={`https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0"
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 text-sm font-bold text-white underline underline-offset-4"
          >
            <MapPin size={16} /> Abrir ubicación en Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}

export function CourseAccessGuard({ courseId }: { courseId: string }) {
  return (
    <div className="bg-card border border-accent/30 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm">
      <div className="w-14 h-14 bg-accent-subtle text-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={28} />
      </div>
      <h2 className="text-xl font-black text-foreground mb-2">Acceso Pendiente</h2>
      <p className="text-sm text-muted mb-6">
        Aún no has adquirido este curso o tu pago está en proceso de verificación por nuestro equipo.
      </p>
      <Link
        href={`/pagar/curso/${courseId}`}
        className="inline-flex items-center gap-2 bg-accent-solid text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-accent-solid-hover transition-colors shadow-md"
      >
        Adquirir Acceso al Curso
      </Link>
    </div>
  );
}

export function CourseModulesPanel({
  course,
  selectedModuleIndex,
  onSelectModule,
  exitHref,
}: {
  course: {
    title: string;
    description: string;
    image: string;
    videoUrl?: string | null;
    totalHours: number;
    instructor: { name: string | null };
    courseModules: (CourseModule & { videoUrl?: string | null })[];
  };
  selectedModuleIndex: number;
  onSelectModule: (index: number) => void;
  exitHref: string;
}) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const moduleContent = useRef<HTMLDivElement>(null);
  const activeModule = course.courseModules[selectedModuleIndex] || null;
  const currentVideoUrl = activeModule?.videoUrl || course.videoUrl || null;
  const embedUrl = getCourseEmbedUrl(currentVideoUrl);
  const totalLessonsCount = course.courseModules.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0,
  );
  const moduleCount = course.courseModules.length;

  function selectModule(index: number) {
    if (index < 0 || index >= moduleCount || index === selectedModuleIndex) return;
    onSelectModule(index);
    moduleContent.current?.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (!touchStart.current || moduleCount < 2) return;
    const deltaX = event.changedTouches[0].clientX - touchStart.current.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(deltaX) < 65 || Math.abs(deltaX) < Math.abs(deltaY) * 1.3) return;
    const nextIndex = selectedModuleIndex + (deltaX < 0 ? 1 : -1);
    selectModule(nextIndex);
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background lg:static lg:z-auto lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start">
      <div className="flex shrink-0 items-center justify-between border-b border-card-border bg-card px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:hidden">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-accent">Curso online</p>
          <p className="truncate text-sm font-bold text-foreground">{course.title}</p>
        </div>
        <Link href={exitHref} aria-label="Salir del curso" className="ml-3 rounded-full border border-card-border p-2 text-foreground">
          <X size={20} />
        </Link>
      </div>
      <div
        ref={moduleContent}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pb-6 lg:col-span-8 lg:space-y-6 lg:overflow-visible lg:pb-0"
        onTouchStart={(event) => {
          touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
        }}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
          <div className="relative aspect-video w-full bg-[#180520] flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={activeModule ? activeModule.title : course.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : course.image ? (
              <div className="relative w-full h-full">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="100vw"
                  unoptimized={course.image.startsWith("/api/dashboard/")}
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-6 text-center text-white">
                  <PlayCircle size={48} className="text-accent mb-2" />
                  <p className="font-bold text-base">Video del módulo en preparación</p>
                  <p className="text-xs text-white/70 max-w-sm mt-1">
                    Revisa el temario y las lecciones detalladas de este módulo en el panel lateral.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-white">
                <Video size={48} className="mx-auto text-accent/40 mb-3" />
                <p className="font-bold text-sm">Sin video configurado</p>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-accent bg-accent-subtle px-2.5 py-1 rounded-md">
                {activeModule
                  ? `Módulo ${selectedModuleIndex + 1} de ${course.courseModules.length}`
                  : "Introducción del Curso"}
              </span>
              <span className="text-xs font-semibold text-muted">
                {course.instructor.name || "Chef Anais Flores"}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {activeModule ? activeModule.title : course.title}
            </h2>

            <p className="text-sm text-muted font-medium mt-3 leading-relaxed">
              {course.description}
            </p>
          </div>
        </div>

        {activeModule && (
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-accent" />
              <h3 className="text-base font-black text-foreground">
                Lecciones de este Módulo ({activeModule.lessons.length})
              </h3>
            </div>

            {activeModule.lessons.length === 0 ? (
              <p className="text-xs text-muted">No hay lecciones desglosadas en este módulo.</p>
            ) : (
              <div className="space-y-3">
                {activeModule.lessons.map((lesson, lIdx) => (
                  <div
                    key={lesson.id}
                    className="bg-section-alt border border-card-border/60 rounded-xl p-4 hover:border-accent/30 transition flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-card border border-card-border flex items-center justify-center text-xs font-black text-accent shrink-0 mt-0.5">
                      {lIdx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground">{lesson.title}</p>
                      {lesson.summary && (
                        <p className="text-xs text-muted mt-1 leading-relaxed">
                          {lesson.summary}
                        </p>
                      )}
                    </div>
                    {lesson.duration > 0 && (
                      <span className="text-xs font-mono text-muted shrink-0 flex items-center gap-1">
                        <Clock size={11} /> {lesson.duration}m
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {moduleCount > 0 && (
        <nav aria-label="Navegación entre módulos" className="shrink-0 border-t border-card-border bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={() => selectModule(selectedModuleIndex - 1)} disabled={selectedModuleIndex === 0} aria-label="Módulo anterior" className="flex size-11 shrink-0 items-center justify-center rounded-full border border-card-border text-foreground disabled:opacity-30">
              <ChevronLeft size={22} />
            </button>
            <div className="min-w-0 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-accent">{selectedModuleIndex + 1} de {moduleCount}</p>
              <p className="truncate text-xs font-bold text-foreground">{activeModule?.title}</p>
              <p className="text-[10px] text-muted">Desliza para cambiar de módulo</p>
            </div>
            <button type="button" onClick={() => selectModule(selectedModuleIndex + 1)} disabled={selectedModuleIndex === moduleCount - 1} aria-label="Módulo siguiente" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-solid text-white disabled:opacity-30">
              <ChevronRight size={22} />
            </button>
          </div>
        </nav>
      )}

      <div className="hidden lg:col-span-4 lg:block bg-card border border-card-border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-card-border">
          <div>
            <h3 className="font-black text-sm text-foreground">Temario del Curso</h3>
            <p className="text-[11px] text-muted font-medium">
              {course.courseModules.length} módulos • {totalLessonsCount} lecciones
            </p>
          </div>
          <span className="text-xs font-black text-accent bg-accent-subtle px-2.5 py-1 rounded-full">
            {course.totalHours}h Total
          </span>
        </div>

        {course.courseModules.length === 0 ? (
          <p className="text-xs text-muted py-4 text-center">
            Aún no hay módulos registrados para esta formación.
          </p>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {course.courseModules.map((m, idx) => {
              const isCurrent = idx === selectedModuleIndex;
              return (
                <button
                  key={m.id}
                  onClick={() => onSelectModule(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3 ${
                    isCurrent
                      ? "bg-accent-subtle border-accent/40 shadow-sm"
                      : "bg-section-alt/50 border-card-border/60 hover:bg-section-alt hover:border-card-border"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                      isCurrent
                        ? "bg-accent-solid text-white"
                        : "bg-card text-muted border border-card-border"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-bold leading-snug line-clamp-2 ${
                        isCurrent ? "text-accent" : "text-foreground"
                      }`}
                    >
                      {m.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted mt-1 font-medium">
                      <span>{m.lessons.length} lecciones</span>
                      {m.duration && <span>• {m.duration}m</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
