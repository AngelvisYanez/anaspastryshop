"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Video, ArrowLeft, Loader2, AlignLeft, ChevronDown, AlertCircle, FileText, Globe, Calendar } from "lucide-react";
import Link from "next/link";
import { updateCourse } from "@/lib/actions/cursos";
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

export default function CourseEditClient({ course, hasEnrolledStudents, mentors, isAdmin }: { course: any, hasEnrolledStudents: boolean, mentors: any[], isAdmin: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selector de Mentor
  const [instructorId, setInstructorId] = useState(course.instructorId || "");

  // Campos Básicos
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description);
  const [price, setPrice] = useState(() => course.price.toString());
  const [language, setLanguage] = useState(course.language || "Español");
  const [level, setLevel] = useState(course.level || "Intermedio");
  
  // Media y Streaming
  const [introVideo, setIntroVideo] = useState(course.introVideo || "");
  const [coverImage, setCoverImage] = useState(course.image || "");
  const [isLive, setIsLive] = useState(course.isLive || false);
  const [liveUrl, setLiveUrl] = useState(course.liveUrl || "");

  // Publicación
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED">((course.status as "DRAFT" | "PUBLISHED" | "SCHEDULED") || "PUBLISHED");
  const [publishedAt, setPublishedAt] = useState(
    course.publishedAt ? new Date(course.publishedAt).toISOString().slice(0, 16) : ""
  );

  // Módulos con Sus Tareas
  const initialModules = course.courseModules.map((m: any) => ({
    title: m.title,
    videoUrl: m.videoUrl || "",
    tasks: m.lessons.map((l: any) => ({
      title: l.title,
      summary: l.summary || ""
    }))
  }));

  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [modules, setModules] = useState<ModuleForm[]>(initialModules.length ? initialModules : [
    { title: "Módulo 1: Introducción", videoUrl: "", tasks: [{ title: "", summary: "" }] }
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
    
    if (isAdmin && !instructorId) {
      setError("Debes asignar un mentor responsable para este curso.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setError(null);

    const totalClasses = modules.reduce((acc, m) => acc + m.tasks.length, 0);
    const totalHours = Math.ceil(totalClasses * 0.5) || 1;

    const res = await updateCourse(course.id, {
      title,
      description,
      price: parseFloat(price),
      totalHours,
      totalClasses,
      language,
      level,
      image: coverImage || undefined,
      introVideo: introVideo || undefined,
      isLive,
      liveUrl: isLive ? liveUrl : undefined,
      status,
      publishedAt: status === "SCHEDULED" ? publishedAt : undefined,
      instructorId: isAdmin ? instructorId : undefined,
      modules: modules.map((m: any) => ({
        title: m.title,
        videoUrl: m.videoUrl || undefined,
        lessons: m.tasks.map((t: any) => ({
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
          <h1 className="text-3xl font-black text-foreground tracking-tighter">
            Editar Curso
          </h1>
          <p className="text-foreground mt-1 font-medium">
            Modificando información de: <span className="font-bold">{course.title}</span>
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
        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">1</span>
            Información del Curso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Solo Admin: Asignar Mentor */}
            {isAdmin && (
              <div className="col-span-1 md:col-span-2 bg-indigo-50/50 p-5 rounded-lg border border-indigo-100 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <label className="block text-sm font-black text-indigo-900 uppercase tracking-widest">
                  Mentor Asignado
                </label>
                <p className="text-xs text-indigo-700 mb-2">Cambia a qué mentor le pertenece este curso editando este campo.</p>
                <select 
                  required 
                  value={instructorId} 
                  onChange={e => setInstructorId(e.target.value)} 
                  className="w-full bg-card border border-indigo-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-indigo-900 font-bold"
                >
                  <option value="" disabled>Selecciona un Mentor...</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.name || "Sin nombre"} ({m.email})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-foreground mb-2">Título del Curso</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted/80" placeholder="Ej. Publicidad en Meta Ads desde Cero" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-foreground mb-2">Descripción del Curso</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all min-h-[100px] text-foreground placeholder:text-muted/80" placeholder="Domina las herramientas esenciales..." />
            </div>
            <div>
              <label className="flex items-center justify-between text-sm font-bold text-foreground mb-2">
                <span>Precio (USD)</span>
                {hasEnrolledStudents && <span className="text-[10px] text-red-500 bg-red-50 px-2 rounded uppercase flex items-center gap-1"><AlertCircle size={10} /> Bloqueado</span>}
              </label>
              <input 
                required 
                value={price} 
                onChange={e => setPrice(e.target.value)} 
                type="number" 
                step="0.01" 
                min="0" 
                disabled={hasEnrolledStudents}
                title={hasEnrolledStudents ? "No puedes cambiar el precio de un curso que tiene alumnos inscritos" : ""}
                className={`w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none transition-all text-foreground placeholder:text-muted/80 ${hasEnrolledStudents ? 'opacity-60 cursor-not-allowed bg-section-alt border-gray-300' : 'focus:border-accent'}`} 
                placeholder="45.00" 
              />
              {hasEnrolledStudents && <p className="text-[10px] mt-1 text-red-500 font-bold">No modificable. Ya existen estudiantes que adquirieron este curso a este precio.</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Nivel</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground">
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>
        </div>

        {/* PARTE 2: Media y Live Streaming */}
        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">2</span>
            Media & Streaming del Curso
          </h2>
          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between text-sm font-bold text-foreground mb-2">
                <span>Video de Introducción / Venta (Opcional)</span>
                <span className="text-[9px] text-accent uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">⚡ Cloudflare Stream / YouTube</span>
              </label>
              <div className="space-y-3">
                <CloudflareVideoUploader
                  currentUrl={introVideo || undefined}
                  onUpload={(url) => setIntroVideo(url)}
                />
                <input value={introVideo} onChange={e => setIntroVideo(e.target.value)} type="url" className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted/80" placeholder="O pega el link directo (YouTube, Vimeo...)..." />
              </div>
              <p className="text-xs text-muted mt-2 font-medium">Este video se reproducirá como portada del curso para usuarios que aún no hayan pagado.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Imagen de Portada (Opcional)</label>
              <ImageUploader value={coverImage} onChange={setCoverImage} />
            </div>
            <div className={`p-5 rounded-lg ${isLive ? 'bg-orange-50 border border-orange-100' : 'bg-section-alt border border-card-border'}`}>
              <div className="flex items-center gap-3 mb-4">
                <input type="checkbox" id="isLive" checked={isLive} onChange={e => setIsLive(e.target.checked)} className="w-5 h-5 accent-orange-500 cursor-pointer" />
                <label htmlFor="isLive" className={`font-bold cursor-pointer ${isLive ? 'text-orange-900' : 'text-foreground'}`}>Activar Clases en Vivo para este curso</label>
              </div>
              {isLive && (
                <div className="mt-6 pt-6 border-t border-orange-200/60 flex flex-col gap-6">
                  <div className="bg-card/60 rounded-lg p-5 border border-orange-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-orange-900 text-sm flex items-center gap-2">
                        📡 Llaves de Transmisión (Cloudflare Live)
                      </h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-100 px-2 py-1 rounded">Próximamente</span>
                    </div>
                    
                    <div className="space-y-4 opacity-50 cursor-not-allowed select-none transition-opacity hover:opacity-70">
                      <div>
                        <label className="block text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-1">RTMPS Server URL</label>
                        <input type="text" readOnly disabled value="rtmps://live.cloudflare.com:443/live/" className="w-full bg-section-alt border border-card-border rounded-lg px-3 py-2.5 text-xs font-mono text-muted cursor-not-allowed outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-1">Stream Key / Clave de Transmisión</label>
                        <input type="password" readOnly disabled value="1234-5678-abcd-qwer" className="w-full bg-section-alt border border-card-border rounded-lg px-3 py-2.5 text-xs font-mono text-muted cursor-not-allowed outline-none" />
                      </div>
                      <p className="text-[10px] text-orange-700/80 leading-relaxed font-medium">Las llaves únicas se generarán automáticamente en este panel una vez que guardes el curso y finalicemos la integración serverless con Cloudflare.</p>
                    </div>
                  </div>

                  <div className="pl-4 border-l-2 border-orange-200">
                    <label className="block text-sm font-bold text-orange-800 mb-2">Alternativa: URL Externa (Zoom, Google Meet, etc)</label>
                    <input value={liveUrl} onChange={e => setLiveUrl(e.target.value)} type="url" className="w-full bg-card border border-orange-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all text-foreground" placeholder="Si no usas Cloudflare, pega el enlace aquí..." />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PARTE 3: Módulos con Tareas */}
        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">3</span>
              Módulos del Curso
            </h2>
            <button type="button" onClick={handleAddModule} className="text-sm font-bold text-accent hover:bg-amber-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <Plus size={16} /> Añadir Módulo
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((m, mIndex) => {
              const isOpen = openModuleIndex === mIndex;
              return (
                <div key={mIndex} className="bg-card rounded-xl border border-card-border overflow-hidden shadow-sm transition-all">
                  {/* CABEZAL ACCORDION */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenModuleIndex(isOpen ? null : mIndex)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenModuleIndex(isOpen ? null : mIndex); } }}
                    className="w-full p-8 flex justify-between items-start hover:bg-section-alt transition-colors cursor-pointer group relative"
                  >
                    {modules.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemoveModule(mIndex); }}
                        className="absolute top-8 right-16 text-red-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors z-10"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <div className="text-left flex-1 pr-16">
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">
                        Módulo 0{mIndex + 1}
                      </span>
                      <span className="text-xl font-bold text-foreground group-hover:text-accent transition-colors">
                        {m.title || `Módulo ${mIndex + 1}`}
                      </span>

                      {/* Vista previa de tareas cuando está cerrado */}
                      {!isOpen && m.tasks.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {m.tasks.map((t, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-3 text-sm text-muted">
                              <div className="w-2 h-2 rounded-full bg-indigo-200 mt-1.5 shrink-0" />
                              <span>
                                {t.title ? (
                                  <>
                                    <span className="font-semibold text-gray-700">{t.title}</span>
                                    {t.summary && <span className="text-muted">: {t.summary.split('\n')[0]}</span>}
                                  </>
                                ) : (
                                  <span className="text-muted italic">Tarea sin título</span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {!isOpen && m.tasks.length === 0 && (
                        <div className="mt-3 text-xs font-bold text-muted/40 uppercase tracking-widest">
                          Sin tareas todavía
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`text-muted/40 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* FORMULARIO ABIERTO */}
                  {isOpen && (
                    <div className="px-8 pb-8 border-t border-card-border pt-6 bg-section-alt/30 space-y-6">
                      {/* Título del módulo */}
                      <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Título del Módulo</label>
                        <input
                          required
                          value={m.title}
                          onChange={(e) => handleModuleChange(mIndex, "title", e.target.value)}
                          className="w-full text-lg font-bold bg-card border border-card-border rounded-xl px-4 py-3 focus:border-accent outline-none transition-colors text-foreground"
                          placeholder="Ej. Módulo 1: Fundamentos y Estructura"
                        />
                      </div>

                      {/* Video del módulo */}
                      {!isLive && (
                        <div className="bg-accent-subtle/30 border border-accent/20 rounded-lg p-5">
                          <label className="flex items-center justify-between text-xs font-bold text-accent uppercase tracking-wider mb-3">
                            <span className="flex items-center gap-2"><Video size={14} /> Video de este Módulo (Opcional)</span>
                            <span className="text-[9px] bg-card dark:bg-card px-2 py-1 rounded shadow-sm text-accent">⚡ Cloudflare Stream</span>
                          </label>
                          <CloudflareVideoUploader
                            currentUrl={m.videoUrl || undefined}
                            onUpload={(url) => handleModuleChange(mIndex, "videoUrl", url)}
                          />
                          <div className="mt-3">
                            <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1 block">O pega una URL externa</label>
                            <input
                              value={m.videoUrl}
                              onChange={(e) => handleModuleChange(mIndex, "videoUrl", e.target.value)}
                              type="url"
                              placeholder="https://... (YouTube, Vimeo, etc)"
                              className="w-full bg-card border border-card-border rounded-xl px-4 py-2.5 outline-none focus:border-accent text-foreground placeholder:text-muted transition-all text-sm"
                            />
                          </div>
                          <p className="text-[10px] text-muted mt-2 font-medium">Cada módulo tiene su propio video. Los alumnos lo verán al acceder a este módulo.</p>
                        </div>
                      )}

                      {/* Tareas del módulo */}
                      <div>
                        <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-4">Tareas del Módulo</label>
                        <div className="space-y-4">
                          {m.tasks.map((t, tIndex) => (
                            <div key={tIndex} className="bg-card border border-card-border rounded-lg p-5 relative">
                              <div className="absolute left-5 top-5 w-6 h-6 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                {tIndex + 1}
                              </div>
                              <div className="pl-9 pr-8">
                                <div className="absolute right-4 top-4">
                                  <button type="button" onClick={() => handleRemoveTask(mIndex, tIndex)} className="text-red-300 hover:text-red-500 transition-colors p-1.5">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                                <div className="mb-3">
                                  <label className="block text-xs font-bold text-foreground mb-1">Nombre de la Tarea</label>
                                  <input
                                    required
                                    value={t.title}
                                    onChange={e => handleTaskChange(mIndex, tIndex, "title", e.target.value)}
                                    placeholder="Ej. El Ecosistema de Meta"
                                    className="w-full bg-section-alt border border-card-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent text-foreground placeholder:text-muted"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5"><AlignLeft size={12}/> Descripción de la Tarea</label>
                                  <textarea
                                    value={t.summary}
                                    onChange={e => handleTaskChange(mIndex, tIndex, "summary", e.target.value)}
                                    placeholder="Ej. Diferencia entre botón Promocionar vs. Ads Manager..."
                                    className="w-full bg-section-alt border border-card-border rounded-lg px-3 py-2 text-sm outline-none focus:border-accent min-h-[80px] text-foreground placeholder:text-muted leading-relaxed"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4">
                          <button type="button" onClick={() => handleAddTask(mIndex)} className="text-sm font-bold text-accent bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                            <Plus size={16} /> Agregar Tarea a este Módulo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

            {/* PARTE 4: Publicación */}
        <div className="bg-card p-8 rounded-xl border border-card-border shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <span className="bg-accent text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">4</span>
            Publicación
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <button
              type="button"
              onClick={() => setStatus("DRAFT")}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all ${status === "DRAFT" ? "border-gray-400 bg-gray-50 text-gray-700" : "border-card-border bg-section-alt text-muted hover:border-gray-300"}`}
            >
              <FileText size={20} />
              Borrador
              <span className="text-[10px] font-normal text-muted">No visible públicamente</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus("PUBLISHED")}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all ${status === "PUBLISHED" ? "border-green-500 bg-green-50 text-green-700" : "border-card-border bg-section-alt text-muted hover:border-green-300"}`}
            >
              <Globe size={20} />
              Publicar ahora
              <span className="text-[10px] font-normal text-muted">Visible inmediatamente</span>
            </button>
            <button
              type="button"
              onClick={() => setStatus("SCHEDULED")}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 font-bold text-sm transition-all ${status === "SCHEDULED" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-card-border bg-section-alt text-muted hover:border-blue-300"}`}
            >
              <Calendar size={20} />
              Programar
              <span className="text-[10px] font-normal text-muted">Publicación automática</span>
            </button>
          </div>
          {status === "SCHEDULED" && (
            <div className="mt-2">
              <label className="block text-sm font-bold text-foreground mb-2">Fecha y hora de publicación</label>
              <input
                required
                type="datetime-local"
                value={publishedAt}
                onChange={e => setPublishedAt(e.target.value)}
                suppressHydrationWarning
                min={new Date().toISOString().slice(0, 16)}
                className="w-full bg-section-alt border border-card-border rounded-xl px-4 py-3 outline-none focus:border-accent transition-all text-foreground"
              />
              <p className="text-xs text-muted mt-2 font-medium">El curso se publicará automáticamente en esa fecha y hora.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading || (status === "SCHEDULED" && !publishedAt)}
            className="bg-accent text-white px-8 py-4 rounded-lg font-black text-lg shadow-xl shadow-gray-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-3"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : null}
            {status === "DRAFT" ? "Guardar Borrador" : status === "SCHEDULED" ? "Guardar y Programar" : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
