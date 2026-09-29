"use client";

import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";
import { CourseFormHeader } from "@/components/CourseFormHeader";
import { ModalitySelector, WorkshopLogistics } from "@/components/CourseFormSections";
import { CourseModulesEditor } from "@/components/CourseModulesEditor";
import { useCourseEditForm } from "./useCourseEditForm";

const fieldClass =
  "w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition text-foreground";
const labelClass = "block text-sm font-bold text-foreground mb-2";
const cardClass =
  "bg-card p-5 sm:p-6 rounded-2xl border border-card-border shadow-sm";

function SectionTitle({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <h2 className="text-lg sm:text-xl font-bold text-foreground mb-5 flex items-center gap-2">
      <span className="bg-accent-solid text-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold shrink-0">
        {step}
      </span>
      {children}
    </h2>
  );
}

export default function CourseEditClient({
  course,
  hasEnrolledStudents,
}: {
  course: any;
  hasEnrolledStudents: boolean;
}) {
  const form = useCourseEditForm(course);

  return (
    <div className="max-w-7xl mx-auto pb-24">
      <CourseFormHeader
        title="Editar Formación"
        description="Actualiza módulos, videos y detalles de logística para workshops presenciales."
      />

      {hasEnrolledStudents && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>
            Este programa ya cuenta con estudiantes inscritos. Modifica los módulos con precaución.
          </span>
        </div>
      )}

      {form.error && (
        <div
          role="alert"
          className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 p-4 rounded-xl mb-6 font-bold text-sm"
        >
          {form.error}
        </div>
      )}

      <form onSubmit={form.handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Columna principal: información + logística */}
          <div className="xl:col-span-7 space-y-6 min-w-0">
            <section className={cardClass}>
              <SectionTitle step={1}>Información de la Formación</SectionTitle>

              <div className="space-y-5">
                <div>
                  <label htmlFor="course-title" className={labelClass}>
                    Título
                  </label>
                  <input
                    id="course-title"
                    required
                    value={form.title}
                    onChange={(e) => form.setTitle(e.target.value)}
                    type="text"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label htmlFor="course-description" className={labelClass}>
                    Descripción
                  </label>
                  <textarea
                    id="course-description"
                    required
                    value={form.description}
                    onChange={(e) => form.setDescription(e.target.value)}
                    className={`${fieldClass} min-h-[110px] resize-y`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="course-price" className={labelClass}>
                      Precio Individual (USD)
                    </label>
                    <input
                      id="course-price"
                      required
                      value={form.price}
                      onChange={(e) => form.setPrice(e.target.value)}
                      type="number"
                      min="0"
                      step="0.01"
                      className={`${fieldClass} font-mono font-bold text-lg max-w-[12rem]`}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <SectionTitle step={2}>Modalidad</SectionTitle>
              <div className="grid grid-cols-1 gap-5">
                <ModalitySelector
                  isLive={form.isLive}
                  onChange={form.setIsLive}
                  onlineDescription="Contenido grabado por módulos y lecciones en video."
                  workshopDescription="Taller presencial con ubicación física, fecha y horario."
                />

                {form.isLive && (
                  <WorkshopLogistics
                    location={form.location}
                    date={form.workshopDate}
                    time={form.workshopTime}
                    onLocationChange={form.setLocation}
                    onDateChange={form.setWorkshopDate}
                    onTimeChange={form.setWorkshopTime}
                  />
                )}
              </div>
            </section>
          </div>

          {/* Columna lateral: media (sticky en desktop) */}
          <aside className="xl:col-span-5 xl:sticky xl:top-6 space-y-6 min-w-0">
            <section className={cardClass}>
              <SectionTitle step={3}>Media & Portada</SectionTitle>
              <div className="space-y-6">
                <div>
                  <div className={labelClass}>Imagen de Portada</div>
                  <ImageUploader value={form.coverImage} onChange={form.setCoverImage} />
                </div>

                <div>
                  <label htmlFor="course-intro-video" className={labelClass}>
                    Video de Introducción
                  </label>
                  <input
                    id="course-intro-video"
                    value={form.introVideo}
                    onChange={(e) => form.setIntroVideo(e.target.value)}
                    type="url"
                    className={`${fieldClass} placeholder:text-muted text-sm`}
                    placeholder="Pega el link (YouTube, Vimeo...)"
                  />
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* Módulos a ancho completo */}
        <CourseModulesEditor
          modules={form.modules}
          sectionStep={4}
          sectionTitle={
            form.isLive
              ? `Módulos o Contenido del Workshop (${form.modules.length})`
              : `Módulos del Curso Online (${form.modules.length})`
          }
          sectionDescription={
            form.isLive
              ? "Define el temario o contenido del workshop presencial que verá el alumno."
              : "Cada módulo cuenta con su video explicativo y se carga en el panel de alumno."
          }
          openModuleIndex={form.openModuleIndex}
          canRemoveModule={form.modules.length > 1}
          onAddModule={form.handleAddModule}
          onRemoveModule={form.handleRemoveModule}
          onToggleModule={(index: number) =>
            form.setOpenModuleIndex(form.openModuleIndex === index ? null : index)
          }
          onModuleChange={form.handleModuleChange}
          onAddTask={form.handleAddTask}
          onTaskChange={form.handleTaskChange}
          onRemoveTask={form.handleRemoveTask}
        />

        <div className="sticky bottom-4 z-20 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-2xl border border-card-border bg-card/95 backdrop-blur-md p-3 sm:p-4 shadow-lg">
          <Link
            href="/dashboard/cursos"
            className="px-6 py-3 rounded-xl text-xs font-bold text-center text-muted hover:text-foreground border border-card-border"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={form.loading}
            aria-busy={form.loading}
            className="px-8 py-3 bg-accent-solid text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent-solid-hover transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent-solid/20"
          >
            {form.loading && <Loader2 size={16} className="animate-spin" />}
            Actualizar Formación
          </button>
        </div>
      </form>
    </div>
  );
}
