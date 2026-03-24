"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { crearTaller, editarTaller } from "@/lib/actions/talleres";
import DynamicAgenda from "../../DynamicAgenda";

interface Mentor {
  id: string;
  name: string | null;
  email: string | null;
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
  
  // Si hay datos iniciales de agenda, los parseamos
  const initialAgenda = initialData?.agenda 
    ? JSON.parse(initialData.agenda) 
    : [{ hour: "", task: "" }];
    
  const [agenda, setAgenda] = useState(initialAgenda);

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
      result = await editarTaller(initialData.id, formData, agenda, includes);
    } else {
      result = await crearTaller(formData, agenda, includes);
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
    <div className="max-w-4xl mx-auto p-6">
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

          {/* Selector de Mentor (Solo para ADMIN) */}
          {userRole === "ADMIN" && (
            <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 space-y-4 mb-8">
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
              <p className="text-[10px] text-gray-400 font-medium px-2">
                * El taller aparecerá en el dashboard del mentor seleccionado.
              </p>
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
                placeholder="Ej. Sede Artica Academy, Coro"
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
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-medium resize-none"
              />
            </div>

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

          <hr className="border-gray-100" />

          {/* Dynamic Agenda */}
          <DynamicAgenda agenda={agenda} setAgenda={setAgenda} />

          <button
            disabled={loading}
            className="w-full bg-[#1A1A2E] text-white py-5 rounded-[2.5rem] font-bold hover:bg-black transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isEditing ? "Guardar Cambios" : "Publicar Taller")}
          </button>
        </form>
      </div>
    </div>
  );
}
