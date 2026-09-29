"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Loader2 } from "lucide-react";
import Link from "next/link";
import { createCourse } from "@/lib/actions/cursos";
import ImageUploader from "@/components/ImageUploader";
import { CourseFormHeader } from "@/components/CourseFormHeader";
import { ModalitySelector, WorkshopLogistics } from "@/components/CourseFormSections";
import { CourseModulesEditor } from "@/components/CourseModulesEditor";
import { WORKSHOP_LOCATION } from "@/lib/utils/workshop";

interface TaskForm {
  title: string;
  summary: string;
}

interface ModuleForm {
  title: string;
  videoUrl: string;
  tasks: TaskForm[];
}

export default function CourseCreateClient({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos Básicos
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hasPrice, setHasPrice] = useState(true);
  const [price, setPrice] = useState("45");
  const [language, setLanguage] = useState("Español");
  
  // Media y Streaming
  const [introVideo, setIntroVideo] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [liveUrl, setLiveUrl] = useState("");

  // Workshop Logistics
  const [location, setLocation] = useState(WORKSHOP_LOCATION);
  const [workshopDate, setWorkshopDate] = useState("");
  const [workshopTime, setWorkshopTime] = useState("09:00 AM — 05:00 PM");

  // Publicación
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED">("PUBLISHED");
  const [publishedAt, setPublishedAt] = useState("");

  // Módulos con Sus Tareas
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [modules, setModules] = useState<ModuleForm[]>([
    { title: "Módulo 1: Introducción y Fundamentos", videoUrl: "", tasks: [{ title: "Técnica Base", summary: "Explicación detallada de ingredientes y gramajes" }] }
  ]);

  const handleAddModule = () => {
    const newIndex = modules.length;
    setModules([...modules, { title: `Módulo ${newIndex + 1}: Nuevo Módulo`, videoUrl: "", tasks: [] }]);
    setOpenModuleIndex(newIndex);
  };

  const handleRemoveModule = (mIndex: number) => {
    const newModules = modules.filter((_, i) => i !== mIndex);
    setModules(newModules);
    setOpenModuleIndex(null);
  };

  const handleAddTask = (mIndex: number) => {
    const newModules = [...modules];
    newModules[mIndex].tasks.push({ title: "", summary: "" });
    setModules(newModules);
  };

  const handleRemoveTask = (mIndex: number, tIndex: number) => {
    const newModules = [...modules];
    newModules[mIndex].tasks = newModules[mIndex].tasks.filter((_, i) => i !== tIndex);
    setModules(newModules);
  };

  const handleModuleChange = (mIndex: number, field: "title" | "videoUrl", val: string) => {
    const newModules = [...modules];
    newModules[mIndex][field] = val;
    setModules(newModules);
  };

  const handleTaskChange = (mIndex: number, tIndex: number, field: keyof TaskForm, val: string) => {
    const newModules = [...modules];
    newModules[mIndex].tasks[tIndex][field] = val;
    setModules(newModules);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    setLoading(true);
    setError(null);

    const totalClasses = modules.reduce((acc, m) => acc + m.tasks.length, 0);
    const totalHours = Math.ceil(totalClasses * 0.5) || 1;

    try {
      const res = await createCourse({
        title,
        description,
        price: hasPrice ? parseFloat(price) : 0,
        totalHours,
        totalClasses,
        language,
        level: "General",
        image: coverImage || undefined,
        introVideo: introVideo || undefined,
        isLive,
        liveUrl: isLive ? liveUrl : undefined,
        location: isLive ? location : undefined,
        workshopDate: isLive ? workshopDate : undefined,
        workshopTime: isLive ? workshopTime : undefined,
        status,
        publishedAt: status === "SCHEDULED" ? publishedAt : undefined,
        instructorId: undefined,
        modules: modules.map(m => ({
          title: m.title,
          videoUrl: m.videoUrl || undefined,
          lessons: m.tasks.map(t => ({
            title: t.title,
            summary: t.summary || undefined,
          }))
        }))
      });

      if (res.error) {
        setError(res.error);
      } else {
        router.push("/dashboard/cursos");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-24 bg-card md:bg-transparent">
      <CourseFormHeader
        title="Crear Curso Online o Workshop Presencial"
        description="Define la modalidad, los módulos con videos y clases, y la logística en caso de taller presencial."
      />

      {error && (
        <div role="alert" className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800 p-4 rounded-xl mb-6 font-bold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PARTE 1: Información Base */}
        <div className="bg-card p-8 rounded-2xl border border-card-border shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="bg-accent-solid text-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold">1</span>
            Información de la Formación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Campos Específicos para Workshop Presencial */}
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="course-title" className="block text-sm font-bold text-foreground mb-2">Título de la Formación</label>
              <input
                id="course-title"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                type="text"
                className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition text-foreground placeholder:text-muted"
                placeholder="Ej. Workshop Pastelería & Glaseados Espejo"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="course-description" className="block text-sm font-bold text-foreground mb-2">Descripción</label>
              <textarea
                id="course-description"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition min-h-[100px] text-foreground placeholder:text-muted"
                placeholder="Aprende técnicas profesionales desde cero con recetas detalladas..."
              />
            </div>

            <ModalitySelector
              isLive={isLive}
              onChange={setIsLive}
              onlineDescription="Contenido grabado por módulos y lecciones en video. Acceso permanente 24/7."
              workshopDescription="Taller intensivo en vivo con ubicación física, fecha fijada y cupos limitados."
            />

            {isLive && (
              <WorkshopLogistics
                location={location}
                date={workshopDate}
                time={workshopTime}
                onLocationChange={setLocation}
                onDateChange={setWorkshopDate}
                onTimeChange={setWorkshopTime}
              />
            )}

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="course-price" className="block text-sm font-bold text-foreground mb-3">Precio Individual (USD)</label>
              <div className="flex items-center gap-4">
                <input
                  id="course-price"
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-48 bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition text-foreground font-mono font-bold text-lg"
                  placeholder="45.00"
                />
                <span className="text-xs text-muted font-medium">
                  Pago individual único. No requiere suscripción mensual.
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* PARTE 2: Media y Portada */}
        <div className="bg-card p-8 rounded-2xl border border-card-border shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="bg-accent-solid text-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold">2</span>
            Media & Portada
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="course-intro-video" className="block text-sm font-bold text-foreground mb-2">Video de Introducción o Trailer</label>
              <input
                id="course-intro-video"
                value={introVideo}
                onChange={e => setIntroVideo(e.target.value)}
                type="url"
                className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm"
                placeholder="Pega el link (YouTube, Vimeo...)"
              />
            </div>

            <div>
              <div className="block text-sm font-bold text-foreground mb-2">Imagen de Portada</div>
              <ImageUploader value={coverImage} onChange={setCoverImage} />
            </div>
          </div>
        </div>

        <CourseModulesEditor
          modules={modules}
          sectionTitle={
            isLive
              ? "Módulos o Contenido del Workshop"
              : "Módulos del Curso Online / Temario"
          }
          sectionDescription={
            isLive
              ? "Define el temario o contenido del workshop presencial que verá el alumno."
              : "Cada módulo se cargará de forma interactiva en el panel del alumno con su video correspondiente."
          }
          openModuleIndex={openModuleIndex}
          canRemoveModule={modules.length > 1}
          onAddModule={handleAddModule}
          onRemoveModule={handleRemoveModule}
          onToggleModule={(index: number) => setOpenModuleIndex(openModuleIndex === index ? null : index)}
          onModuleChange={handleModuleChange}
          onAddTask={handleAddTask}
          onTaskChange={handleTaskChange}
          onRemoveTask={handleRemoveTask}
        />

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard/cursos"
            className="px-6 py-3 rounded-xl text-xs font-bold text-muted hover:text-foreground border border-card-border"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className="px-8 py-3 bg-accent-solid text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent-solid-hover transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-accent-solid/20"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Guardar y Publicar
          </button>
        </div>
      </form>
    </div>
  );
}
