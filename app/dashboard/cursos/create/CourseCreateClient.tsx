"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Trash2, Video, ArrowLeft, Loader2, AlignLeft, ChevronDown,
  FileText, Globe, Calendar, MapPin, Clock, Tag, Sparkles,
} from "lucide-react";
import Link from "next/link";
import { createCourse } from "@/lib/actions/cursos";
import CloudflareVideoUploader from "@/components/CloudflareVideoUploader";
import ImageUploader from "@/components/ImageUploader";

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
  const [location, setLocation] = useState("Caracas, Las Mercedes — Sede Ana's Pastry Shop");
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
      setLoading(false);
    } else {
      router.push("/dashboard/cursos");
    }
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-24 bg-card md:bg-transparent">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/cursos" className="p-2 hover:bg-card rounded-xl transition-colors border border-transparent hover:border-card-border">
          <ArrowLeft size={24} className="text-foreground" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Crear Curso Online o Workshop Presencial
          </h1>
          <p className="text-muted mt-1 font-medium">
            Define la modalidad, los módulos con videos y clases, y la logística en caso de taller presencial.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-bold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PARTE 1: Información Base */}
        <div className="bg-card p-8 rounded-2xl border border-card-border shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold">1</span>
            Información de la Formación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Campos Específicos para Workshop Presencial */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-foreground mb-2">Título de la Formación</label>
              <input
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                type="text"
                className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted"
                placeholder="Ej. Workshop Pastelería & Glaseados Espejo"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-foreground mb-2">Descripción</label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all min-h-[100px] text-foreground placeholder:text-muted"
                placeholder="Aprende técnicas profesionales desde cero con recetas detalladas..."
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-foreground mb-3">Modalidad del Programa</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsLive(false)}
                  className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${
                    !isLive
                      ? "border-accent bg-pink-500/10 text-accent"
                      : "border-card-border bg-section-alt text-muted hover:border-card-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Video size={18} />
                    <span className="text-sm">Curso Online</span>
                  </div>
                  <p className="text-xs font-normal opacity-80">
                    Contenido grabado por módulos y lecciones en video. Acceso permanente 24/7.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setIsLive(true)}
                  className={`p-4 rounded-xl border-2 text-left font-bold transition-all ${
                    isLive
                      ? "border-accent bg-accent-subtle text-accent"
                      : "border-card-border bg-section-alt text-muted hover:border-card-border/80"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={18} />
                    <span className="text-sm">Workshop Presencial</span>
                  </div>
                  <p className="text-xs font-normal opacity-80">
                    Taller intensivo en vivo con ubicación física, fecha fijada y cupos limitados.
                  </p>
                </button>
              </div>
            </div>

            {/* Campos Específicos para Workshop Presencial */}
            {isLive && (
              <div className="col-span-1 md:col-span-2 bg-accent-subtle/30 border border-accent/20 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-accent font-black text-xs uppercase tracking-wider">
                  <Sparkles size={16} /> Logística del Workshop Presencial
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <MapPin size={13} className="text-accent" /> Ubicación Física del Taller
                  </label>
                  <input
                    type="text"
                    required={isLive}
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="Ej. Caracas, Las Mercedes — Sede Ana's Pastry Shop"
                    className="w-full bg-background border border-card-border rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Calendar size={13} className="text-accent" /> Fecha del Workshop
                    </label>
                    <input
                      type="text"
                      required={isLive}
                      value={workshopDate}
                      onChange={e => setWorkshopDate(e.target.value)}
                      placeholder="Ej. Sábado 15 de Noviembre, 2025"
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                      <Clock size={13} className="text-accent" /> Horario del Workshop
                    </label>
                    <input
                      type="text"
                      required={isLive}
                      value={workshopTime}
                      onChange={e => setWorkshopTime(e.target.value)}
                      placeholder="Ej. 09:00 AM — 05:00 PM"
                      className="w-full bg-background border border-card-border rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-foreground mb-3">Precio Individual (USD)</label>
              <div className="flex items-center gap-4">
                <input
                  required
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-48 bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground font-mono font-bold text-lg"
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
            <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold">2</span>
            Media & Portada
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Video de Introducción o Trailer</label>
              <div className="space-y-3">
                <CloudflareVideoUploader
                  currentUrl={introVideo || undefined}
                  onUpload={(url) => setIntroVideo(url)}
                />
                <input
                  value={introVideo}
                  onChange={e => setIntroVideo(e.target.value)}
                  type="url"
                  className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm"
                  placeholder="O pega el link directo (YouTube, Vimeo...)..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Imagen de Portada</label>
              <ImageUploader value={coverImage} onChange={setCoverImage} />
            </div>
          </div>
        </div>

        {/* PARTE 3: Módulos con Clases */}
        <div className="bg-card p-8 rounded-2xl border border-card-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs font-bold">3</span>
                Módulos del Curso Online / Temario
              </h2>
              <p className="text-xs text-muted mt-1 font-medium">
                Cada módulo se cargará de forma interactiva en el panel del alumno con su video correspondiente.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddModule}
              className="text-xs font-bold text-accent bg-accent/10 hover:bg-accent/20 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              <Plus size={15} /> Añadir Módulo
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((m, mIndex) => {
              const isOpen = openModuleIndex === mIndex;
              return (
                <div key={mIndex} className="bg-card rounded-2xl border border-card-border overflow-hidden shadow-sm transition-all">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenModuleIndex(isOpen ? null : mIndex)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenModuleIndex(isOpen ? null : mIndex); } }}
                    className="w-full p-6 flex justify-between items-start hover:bg-section-alt transition-colors cursor-pointer group relative"
                  >
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveModule(mIndex); }}
                        className="absolute top-6 right-16 text-red-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <div className="text-left flex-1 pr-16">
                      <span className="text-[11px] font-black text-accent uppercase tracking-widest block mb-1">
                        Módulo 0{mIndex + 1}
                      </span>
                      <span className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                        {m.title || `Módulo ${mIndex + 1}`}
                      </span>

                      {!isOpen && m.tasks.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {m.tasks.map((t, tIdx) => (
                            <span key={tIdx} className="text-[11px] bg-section-alt px-2 py-0.5 rounded-md text-muted border border-card-border">
                              {t.title || `Tema ${tIdx + 1}`}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronDown size={20} className={`text-muted transition-transform mt-1 ${isOpen ? "rotate-180" : ""}`} />
                  </div>

                  {isOpen && (
                    <div className="p-6 pt-0 border-t border-card-border space-y-6">
                      <div className="pt-4">
                        <label className="block text-xs font-bold text-foreground mb-1.5">Título del Módulo</label>
                        <input
                          value={m.title}
                          onChange={e => handleModuleChange(mIndex, "title", e.target.value)}
                          type="text"
                          className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-2.5 outline-none focus:border-accent transition-all text-foreground text-sm font-semibold"
                          placeholder="Ej. Módulo 1: Fundamentos y Masas Base"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-foreground mb-1.5">Video del Módulo (Video Principal)</label>
                        <CloudflareVideoUploader
                          currentUrl={m.videoUrl || undefined}
                          onUpload={(url) => handleModuleChange(mIndex, "videoUrl", url)}
                        />
                        <input
                          value={m.videoUrl}
                          onChange={e => handleModuleChange(mIndex, "videoUrl", e.target.value)}
                          type="url"
                          className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-2 mt-2 outline-none focus:border-accent text-foreground text-xs"
                          placeholder="O ingresa enlace de Cloudflare Stream, Vimeo o YouTube..."
                        />
                      </div>

                      {/* Clases / Temas */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                            Lecciones o Pasos ({m.tasks.length})
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddTask(mIndex)}
                            className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
                          >
                            <Plus size={12} /> Agregar Lección
                          </button>
                        </div>

                        {m.tasks.map((task, tIndex) => (
                          <div key={tIndex} className="bg-section-alt p-4 rounded-xl border border-card-border space-y-2">
                            <div className="flex justify-between items-center gap-2">
                              <input
                                value={task.title}
                                onChange={e => handleTaskChange(mIndex, tIndex, "title", e.target.value)}
                                type="text"
                                className="flex-1 bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs font-bold text-foreground outline-none focus:border-accent"
                                placeholder={`Nombre de la lección ${tIndex + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveTask(mIndex, tIndex)}
                                className="text-red-400 hover:text-red-500 p-1.5 rounded-lg"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <textarea
                              value={task.summary}
                              onChange={e => handleTaskChange(mIndex, tIndex, "summary", e.target.value)}
                              rows={2}
                              className="w-full bg-background border border-card-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted outline-none focus:border-accent"
                              placeholder="Resumen o receta de la clase (opcional)..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

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
            className="px-8 py-3 bg-accent text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-pink-600/20"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Guardar y Publicar
          </button>
        </div>
      </form>
    </div>
  );
}
