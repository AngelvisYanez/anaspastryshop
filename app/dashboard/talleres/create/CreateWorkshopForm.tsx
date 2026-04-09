"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, User, Plus, Trash2, ChevronDown, AlignLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearTaller, editarTaller } from "@/lib/actions/talleres";
import DynamicAgenda from "../../DynamicAgenda";

interface Mentor {
  id: string;
  name: string | null;
  email: string | null;
}

interface TopicForm {
  title: string;
  summary: string;
}

interface ModuleForm {
  title: string;
  topics: TopicForm[];
}

export default function CreateWorkshopForm({
  userRole,
  mentors,
  categories,
  initialData,
  isEditing = false,
}: {
  userRole: string;
  mentors: Mentor[];
  categories: { id: string; name: string }[];
  initialData?: any;
  isEditing?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Módulos con sus Tópicos (Temario)
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(0);
  const [modules, setModules] = useState<ModuleForm[]>(
    initialData?.modules?.map((m: any) => ({
      title: m.title,
      topics: m.topics?.map((t: any) => ({ title: t.title, summary: t.summary || "" })) || []
    })) || [
      { title: "Módulo 1: Introducción", topics: [{ title: "", summary: "" }] }
    ]
  );

  const handleAddModule = () => {
    const newIndex = modules.length;
    setModules([...modules, { title: `Módulo ${newIndex + 1}: Nuevo Módulo`, topics: [] }]);
    setOpenModuleIndex(newIndex);
  };

  const handleRemoveModule = (mIndex: number) => {
    const newModules = modules.filter((_, i) => i !== mIndex);
    setModules(newModules);
    setOpenModuleIndex(null);
  };

  const handleAddTopic = (mIndex: number) => {
    const newModules = [...modules];
    newModules[mIndex].topics.push({ title: "", summary: "" });
    setModules(newModules);
  };

  const handleRemoveTopic = (mIndex: number, tIndex: number) => {
    const newModules = [...modules];
    newModules[mIndex].topics = newModules[mIndex].topics.filter((_, i) => i !== tIndex);
    setModules(newModules);
  };

  const handleModuleChange = (mIndex: number, val: string) => {
    const newModules = [...modules];
    newModules[mIndex].title = val;
    setModules(newModules);
  };

  const handleTopicChange = (mIndex: number, tIndex: number, field: keyof TopicForm, val: string) => {
    const newModules = [...modules];
    newModules[mIndex].topics[tIndex][field] = val;
    setModules(newModules);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const includes = formData.get("includes")?.toString().split(",") || [];

    let result;
    if (isEditing && initialData?.id) {
      result = await editarTaller(initialData.id, formData, includes, modules);
    } else {
      result = await crearTaller(formData, includes, modules);
    }

    if (result && result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/dashboard/talleres");
      router.refresh();
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:pb-24">
      <Link
        href="/dashboard/talleres"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5A4FCF] transition-colors mb-8 text-xs font-black uppercase tracking-[0.2em]"
      >
        <ArrowLeft size={14} /> Volver a Talleres
      </Link>

      <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-xl border border-gray-100">
        <h1 className="text-3xl font-black text-[#1A1A2E] mb-2">
          {isEditing ? `Editar: ${initialData.title}` : "Crear Nuevo Taller"}
        </h1>
        <p className="text-gray-400 font-medium mb-10">
          {isEditing 
            ? "Mofidica los valores necesarios y guarda los cambios."
            : userRole === "ADMIN" 
              ? "Como Administrador, puedes crear el taller y asignar el mentor responsable."
              : "Llena la información de tu próximo evento presencial u online."
          }
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold">
              {error}
            </div>
          )}

          {/* PARTE 1: Información Base */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2">
              <span className="bg-[#5A4FCF] text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">1</span>
              Información del Taller
            </h2>

            {/* Selector de Mentor (Solo para ADMIN) */}
            {userRole === "ADMIN" && (
              <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-4">
                <div className="flex items-center gap-2 text-[#5A4FCF] font-bold text-sm">
                  <User size={18} /> Asignar Mentor del Taller
                </div>
                <select
                  name="instructorId"
                  required
                  defaultValue={initialData?.instructorId || ""}
                  className="w-full bg-white border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-bold text-[#1A1A2E]"
                >
                  <option value="">Selecciona un Mentor...</option>
                  {mentors.map((mentor) => (
                    <option key={mentor.id} value={mentor.id}>
                      {mentor.name || mentor.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Título del Taller
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={initialData?.title}
                  placeholder="Ej. Bootcamp de React"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center pr-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                    Categoría
                  </label>
                  {userRole === "ADMIN" && (
                    <Link href="/dashboard/categorias" className="text-[10px] font-bold text-[#5A4FCF] hover:underline">
                      Gestionar
                    </Link>
                  )}
                </div>
                <select
                  name="category"
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium text-[#1A1A2E]"
                  defaultValue={initialData?.category || ""}
                >
                  <option value="" disabled>Seleccionar categoría...</option>
                  {categories.length > 0 ? (
                    categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>No hay categorías creadas</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Precio (USD)
                </label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  required
                  defaultValue={initialData?.price}
                  placeholder="Ej. 15.00"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Cupos Disponibles
                </label>
                <input
                  type="number"
                  name="slots"
                  required
                  defaultValue={initialData?.slots}
                  placeholder="Ej. 20"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Fecha
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  defaultValue={initialData ? formatDateForInput(initialData.date) : ""}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Horario
                </label>
                <input
                  type="text"
                  name="time"
                  required
                  defaultValue={initialData?.time}
                  placeholder="Ej. 09:00 AM - 04:00 PM"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={initialData?.location}
                  placeholder="Ej. Sede Articademy, Latinoamérica"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  defaultValue={initialData?.description}
                  placeholder="Describe el taller..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium resize-none text-sm"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* PARTE 2: Temario del Taller (Módulos) */}
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2">
                <span className="bg-[#5A4FCF] text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">2</span>
                Temario por Módulos
              </h2>
              <button type="button" onClick={handleAddModule} className="text-xs font-black text-[#5A4FCF] bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2">
                <Plus size={14} /> Añadir Módulo
              </button>
            </div>

            <div className="space-y-4">
              {modules.map((m, mIndex) => {
                const isOpen = openModuleIndex === mIndex;
                return (
                  <div key={mIndex} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm transition-all">
                    {/* CABEZAL ACCORDION */}
                    <div
                      onClick={() => setOpenModuleIndex(isOpen ? null : mIndex)}
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
                      <div className="text-left flex-1 pr-16 font-bold">
                        <span className="text-[10px] font-black text-[#5A4FCF] uppercase tracking-widest block mb-1">
                          Módulo 0{mIndex + 1}
                        </span>
                        <span className="text-lg font-black text-[#1A1A2E] group-hover:text-[#5A4FCF] transition-colors">
                          {m.title || `Módulo ${mIndex + 1}`}
                        </span>
                      </div>
                      <ChevronDown className={`text-gray-300 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* FORMULARIO ABIERTO */}
                    {isOpen && (
                      <div className="px-8 pb-8 border-t border-gray-50 pt-6 bg-gray-50/30 space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Título del Módulo</label>
                          <input
                            required
                            value={m.title}
                            onChange={(e) => handleModuleChange(mIndex, e.target.value)}
                            className="w-full text-lg font-bold bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#5A4FCF] outline-none transition-all text-[#1A1A2E]"
                            placeholder="Ej. Módulo 1: Fundamentos"
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Temas / Puntos a Tratar</label>
                          {m.topics.map((t, tIndex) => (
                            <div key={tIndex} className="bg-white border border-gray-100 rounded-2xl p-5 relative shadow-sm">
                              <div className="absolute left-5 top-5 w-6 h-6 bg-indigo-50 text-indigo-400 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                                {tIndex + 1}
                              </div>
                              <div className="pl-9 pr-8">
                                <div className="absolute right-4 top-4">
                                  <button type="button" onClick={() => handleRemoveTopic(mIndex, tIndex)} className="text-red-300 hover:text-red-500 transition-colors p-1.5">
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                                <div className="mb-3">
                                  <input
                                    required
                                    value={t.title}
                                    onChange={e => handleTopicChange(mIndex, tIndex, "title", e.target.value)}
                                    placeholder="Nombre del Tema (ej. Instalación de Herramientas)"
                                    className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5A4FCF] text-[#1A1A2E] font-bold"
                                  />
                                </div>
                                <div>
                                  <textarea
                                    value={t.summary}
                                    onChange={e => handleTopicChange(mIndex, tIndex, "summary", e.target.value)}
                                    placeholder="Breve descripción de lo que se verá..."
                                    className="w-full bg-gray-50 border-none rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#5A4FCF] min-h-[60px] text-gray-600 font-medium resize-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button type="button" onClick={() => handleAddTopic(mIndex)} className="text-[10px] font-black text-[#5A4FCF] bg-indigo-50/50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all uppercase tracking-widest flex items-center gap-2">
                            <Plus size={14} /> Añadir Tema
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* PARTE 3: Agenda y Detalles */}
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-[#1A1A2E] flex items-center gap-2">
              <span className="bg-[#5A4FCF] text-white w-6 h-6 flex items-center justify-center rounded-md text-xs">3</span>
              Cronograma & Extras
            </h2>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                Que incluye (separado por comas)
              </label>
              <input
                type="text"
                name="includes"
                defaultValue={initialData?.includes || ""}
                placeholder="Ej. Certificado, Coffee Break, Material de apoyo"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">
                Imagen de Portada (URL)
              </label>
              <input
                type="text"
                name="image"
                defaultValue={initialData?.image || ""}
                placeholder="https://urldeimagen.com"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-[#1A1A2E] text-white py-5 rounded-[2.5rem] font-bold hover:bg-[#5A4FCF] transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest flex justify-center items-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isEditing ? "Guardar Cambios" : "Publicar Taller")}
          </button>
        </form>
      </div>
    </div>
  );
}

