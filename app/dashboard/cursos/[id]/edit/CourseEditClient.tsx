"use client";

import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import CloudflareVideoUploader from "@/components/CloudflareVideoUploader";
import ImageUploader from "@/components/ImageUploader";
import { CourseFormHeader } from "@/components/CourseFormHeader";
import { ModalitySelector, WorkshopLogistics } from "@/components/CourseFormSections";
import { CourseModulesEditor } from "@/components/CourseModulesEditor";
import { useCourseEditForm } from "./useCourseEditForm";

export default function CourseEditClient({
  course,
  hasEnrolledStudents,
}: {
  course: any;
  hasEnrolledStudents: boolean;
}) {
  const form = useCourseEditForm(course);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-24 bg-card md:bg-transparent">
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

      <form onSubmit={form.handleSubmit} className="space-y-8">
        <div className="bg-card p-8 rounded-2xl border border-card-border shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="bg-accent-solid text-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold">
              1
            </span>
            Información de la Formación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="course-title" className="block text-sm font-bold text-foreground mb-2">
                Título
              </label>
              <input
                id="course-title"
                required
                value={form.title}
                onChange={(e) => form.setTitle(e.target.value)}
                type="text"
                className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition text-foreground"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label
                htmlFor="course-description"
                className="block text-sm font-bold text-foreground mb-2"
              >
                Descripción
              </label>
              <textarea
                id="course-description"
                required
                value={form.description}
                onChange={(e) => form.setDescription(e.target.value)}
                className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition min-h-[100px] text-foreground"
              />
            </div>

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

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="course-price" className="block text-sm font-bold text-foreground mb-2">
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
                className="w-48 bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition text-foreground font-mono font-bold text-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-card-border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="bg-accent-solid text-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold">
              2
            </span>
            Media & Portada
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="course-intro-video"
                className="block text-sm font-bold text-foreground mb-2"
              >
                Video de Introducción
              </label>
              <div className="space-y-3">
                <CloudflareVideoUploader
                  currentUrl={form.introVideo || undefined}
                  onUpload={(url) => form.setIntroVideo(url)}
                />
                <input
                  id="course-intro-video"
                  value={form.introVideo}
                  onChange={(e) => form.setIntroVideo(e.target.value)}
                  type="url"
                  className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm"
                  placeholder="O pega el link directo..."
                />
              </div>
            </div>

            <div>
              <div className="block text-sm font-bold text-foreground mb-2">Imagen de Portada</div>
              <ImageUploader value={form.coverImage} onChange={form.setCoverImage} />
            </div>
          </div>
        </div>

        <CourseModulesEditor
          modules={form.modules}
          sectionTitle={`Módulos del Curso Online (${form.modules.length})`}
          sectionDescription="Cada módulo cuenta con su video explicativo y se carga en el panel de alumno."
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

        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/cursos"
            className="px-6 py-3 rounded-xl text-xs font-bold text-muted hover:text-foreground border border-card-border"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={form.loading}
            aria-busy={form.loading}
            className="px-8 py-3 bg-accent-solid text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent-solid-hover transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-accent-solid/20"
          >
            {form.loading && <Loader2 size={16} className="animate-spin" />}
            Actualizar Formación
          </button>
        </div>
      </form>
    </div>
  );
}
