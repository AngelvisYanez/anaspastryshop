"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Video, ArrowLeft, Loader2, AlignLeft, ChevronDown, Upload, AlertCircle } from "lucide-react";
import Link from "next/link";
import { updateCourse } from "@/lib/actions/cursos";

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
    <div className="p-8 max-w-5xl mx-auto pb-24 bg-white md:bg-transparent -mt-8 pt-12">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/cursos" className="p-2 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-gray-100">
          <ArrowLeft size={24} className="text-[#0B1F3A]" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tighter">
            Editar Curso
          </h1>
          <p className="text-gray-600 mt-1 font-medium">
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
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#0B1F3A] mb-6 flex items-center gap-2">
            <span className="bg-[#C9A84C] text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">1</span>
            Información del Curso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Solo Admin: Asignar Mentor */}
            {isAdmin && (
              <div className="col-span-1 md:col-span-2 bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex flex-col gap-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <label className="block text-sm font-black text-indigo-900 uppercase tracking-widest">
                  Mentor Asignado
                </label>
                <p className="text-xs text-indigo-700 mb-2">Cambia a qué mentor le pertenece este curso editando este campo.</p>
                <select 
                  required 
                  value={instructorId} 
                  onChange={e => setInstructorId(e.target.value)} 
                  className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all text-indigo-900 font-bold"
                >
                  <option value="" disabled>Selecciona un Mentor...</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.name || "Sin nombre"} ({m.email})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-[#0B1F3A] mb-2">Título del Curso</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#C9A84C] transition-all text-[#0B1F3A] placeholder:text-gray-500/80" placeholder="Ej. Publicidad en Meta Ads desde Cero" />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-[#0B1F3A] mb-2">Descripción del Curso</label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#C9A84C] transition-all min-h-[100px] text-[#0B1F3A] placeholder:text-gray-500/80" placeholder="Domina las herramientas esenciales..." />
            </div>
            <div>
              <label className="flex items-center justify-between text-sm font-bold text-[#0B1F3A] mb-2">
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
                className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none transition-all text-[#0B1F3A] placeholder:text-gray-500/80 ${hasEnrolledStudents ? 'opacity-60 cursor-not-allowed bg-gray-100 border-gray-300' : 'focus:border-[#C9A84C]'}`} 
                placeholder="45.00" 
              />
              {hasEnrolledStudents && <p className="text-[10px] mt-1 text-red-500 font-bold">No modificable. Ya existen estudiantes que adquirieron este curso a este precio.</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0B1F3A] mb-2">Nivel</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#C9A84C] transition-all text-[#0B1F3A]">
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>
        </div>

        {/* PARTE 2: Media y Live Streaming */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#0B1F3A] mb-6 flex items-center gap-2">
            <span className="bg-[#C9A84C] text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">2</span>
            Media & Streaming del Curso
          </h2>
          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between text-sm font-bold text-[#0B1F3A] mb-2">
                <span>Video de Introducción / Venta (Opcional)</span>
                <span className="text-[9px] text-[#C9A84C] uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-md">⚡ Cloudflare Stream / YouTube</span>
              </label>
              <div className="flex flex-col md:flex-row gap-3">
                <button type="button" disabled className="flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-bold py-3 px-6 rounded-xl border border-gray-200 cursor-not-allowed shrink-0">
                  <Upload size={18} /> Subir Archivo (.mp4)
                </button>
                <input value={introVideo} onChange={e => setIntroVideo(e.target.value)} type="url" className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#C9A84C] transition-all text-[#0B1F3A] placeholder:text-gray-500/80" placeholder="O pega el link directo..." />
              </div>
              <p className="text-xs text-gray-500 mt-2 font-medium">Este video se reproducirá como portada del curso para usuarios que aún no hayan pagado.</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0B1F3A] mb-2">Imagen de Portada Opcional (URL)</label>
              <input value={coverImage} onChange={e => setCoverImage(e.target.value)} type="url" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#C9A84C] transition-all text-[#0B1F3A] placeholder:text-gray-500/80" placeholder="https://..." />
            </div>
            <div className={`p-5 rounded-2xl ${isLive ? 'bg-orange-50 border border-orange-100' : 'bg-gray-50 border border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <input type="checkbox" id="isLive" checked={isLive} onChange={e => setIsLive(e.target.checked)} className="w-5 h-5 accent-orange-500 cursor-pointer" />
                <label htmlFor="isLive" className={`font-bold cursor-pointer ${isLive ? 'text-orange-900' : 'text-gray-600'}`}>Activar Clases en Vivo para este curso</label>
              </div>
              {isLive && (
                <div className="mt-6 pt-6 border-t border-orange-200/60 flex flex-col gap-6">
                  <div className="bg-white/60 rounded-2xl p-5 border border-orange-200 shadow-sm relative overflow-hidden">
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
                        <input type="text" readOnly disabled value="rtmps://live.cloudflare.com:443/live/" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono text-gray-400 cursor-not-allowed outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-1">Stream Key / Clave de Transmisión</label>
                        <input type="password" readOnly disabled value="1234-5678-abcd-qwer" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono text-gray-400 cursor-not-allowed outline-none" />
                      </div>
                      <p className="text-[10px] text-orange-700/80 leading-relaxed font-medium">Las llaves únicas se generarán automáticamente en este panel una vez que guardes el curso y finalicemos la integración serverless con Cloudflare.</p>
                    </div>
                  </div>

                  <div className="pl-4 border-l-2 border-orange-200">
                    <label className="block text-sm font-bold text-orange-800 mb-2">Alternativa: URL Externa (Zoom, Google Meet, etc)</label>
                    <input value={liveUrl} onChange={e => setLiveUrl(e.target.value)} type="url" className="w-full bg-white border border-orange-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-all text-[#0B1F3A]" placeholder="Si no usas Cloudflare, pega el enlace aquí..." />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PARTE 3: Módulos con Tareas */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#0B1F3A] flex items-center gap-2">
              <span className="bg-[#C9A84C] text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">3</span>
              Módulos del Curso
            </h2>
            <button type="button" onClick={handleAddModule} className="text-sm font-bold text-[#C9A84C] hover:bg-amber-50 px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
              <Plus size={16} /> Añadir Módulo
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((m, mIndex) => {
              const isOpen = openModuleIndex === mIndex;
              return (
                <div key={mIndex} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm transition-all">
                  {/* CABEZAL ACCORDION */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setOpenModuleIndex(isOpen ? null : mIndex)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenModuleIndex(isOpen ? null : mIndex); } }}
                    className="w-full p-8 flex justify-between items-start hover:bg-gray-50 transition-colors cursor-pointer group relative"
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
                      <span className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest block mb-1">
                        Módulo 0{mIndex + 1}
                      </span>
                      <span className="text-xl font-bold text-[#0B1F3A] group-hover:text-[#C9A84C] transition-colors">
                        {m.title || `Módulo ${mIndex + 1}`}
                      </span>

                      {/* Vista previa de tareas cuando está cerrado */}
                      {!isOpen && m.tasks.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {m.tasks.map((t, tIdx) => (
                            <div key={tIdx} className="flex items-start gap-3 text-sm text-gray-500">
                              <div className="w-2 h-2 rounded-full bg-indigo-200 mt-1.5 shrink-0" />
                              <span>
                                {t.title ? (
                                  <>
                                    <span className="font-semibold text-gray-700">{t.title}</span>
                                    {t.summary && <span className="text-gray-400">: {t.summary.split('\n')[0]}</span>}
                                  </>
                                ) : (
                                  <span className="text-gray-400 italic">Tarea sin título</span>
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {!isOpen && m.tasks.length === 0 && (
                        <div className="mt-3 text-xs font-bold text-gray-300 uppercase tracking-widest">
                          Sin tareas todavía
                        </div>
                      )}
                    </div>
                    <ChevronDown className={`text-gray-300 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* FORMULARIO ABIERTO */}
                  {isOpen && (
                    <div className="px-8 pb-8 border-t border-gray-50 pt-6 bg-gray-50/30 space-y-6">
                      {/* Título del módulo */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Título del Módulo</label>
                        <input
                          required
                          value={m.title}
                          onChange={(e) => handleModuleChange(mIndex, "title", e.target.value)}
                          className="w-full text-lg font-bold bg-white border border-gray-200 rounded-xl px-4 py-3 focus:border-[#C9A84C] outline-none transition-colors text-[#0B1F3A]"
                          placeholder="Ej. Módulo 1: Fundamentos y Estructura"
                        />
                      </div>

                      {/* Video del módulo (Oculto si es Streaming en Vivo) */}
                      {!isLive && (
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5">
                          <label className="flex items-center justify-between text-xs font-bold text-[#C9A84C] uppercase tracking-wider mb-2">
                            <span className="flex items-center gap-2"><Video size={14} /> Video de este Módulo (Opcional)</span>
                            <span className="text-[9px] bg-white px-2 py-1 rounded shadow-sm text-indigo-400">⚡ Cloudflare Ready</span>
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button type="button" disabled className="flex xl:w-auto w-full items-center justify-center gap-2 bg-white/50 text-indigo-300 font-bold py-3 px-4 rounded-xl border border-indigo-100 cursor-not-allowed shrink-0 text-sm">
                              <Upload size={16} /> Subir Video
                            </button>
                            <input
                              value={m.videoUrl}
                              onChange={(e) => handleModuleChange(mIndex, "videoUrl", e.target.value)}
                              type="url"
                              placeholder="O pega el link aquí..."
                              className="flex-1 bg-white border border-indigo-200 rounded-xl px-4 py-3 outline-none focus:border-[#C9A84C] text-[#C9A84C] placeholder:text-gray-400 transition-all text-sm"
                            />
                          </div>
                          <p className="text-[10px] text-indigo-400 mt-2 font-medium">Cada módulo tiene su propio video. Los alumnos lo verán al acceder a este módulo.</p>
                        </div>
                      )}

                      {/* Tareas del módulo */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Tareas del Módulo</label>
                        <div className="space-y-4">
                          {m.tasks.map((t, tIndex) => (
                            <div key={tIndex} className="bg-white border border-gray-100 rounded-2xl p-5 relative">
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
                                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1">Nombre de la Tarea</label>
                                  <input
                                    required
                                    value={t.title}
                                    onChange={e => handleTaskChange(mIndex, tIndex, "title", e.target.value)}
                                    placeholder="Ej. El Ecosistema de Meta"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C9A84C] text-[#0B1F3A] placeholder:text-gray-400"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-[#0B1F3A] mb-1 flex items-center gap-1.5"><AlignLeft size={12}/> Descripción de la Tarea</label>
                                  <textarea
                                    value={t.summary}
                                    onChange={e => handleTaskChange(mIndex, tIndex, "summary", e.target.value)}
                                    placeholder="Ej. Diferencia entre botón Promocionar vs. Ads Manager..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#C9A84C] min-h-[80px] text-[#0B1F3A] placeholder:text-gray-400 leading-relaxed"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4">
                          <button type="button" onClick={() => handleAddTask(mIndex)} className="text-sm font-bold text-[#C9A84C] bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
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

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#C9A84C] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-gray-200 hover:bg-indigo-600 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-3"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : null}
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
