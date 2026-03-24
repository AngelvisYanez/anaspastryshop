"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tag, Plus, Trash2, Loader2, CheckCircle } from "lucide-react";
import { createCategory, deleteCategory } from "@/lib/actions/categorias";

export default function CategoryManager({ 
  initialCategories 
}: { 
  initialCategories: { id: string, name: string }[] 
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const result = await createCategory(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.category) {
      setCategories([...categories, result.category]);
      setSuccess("Categoría agregada correctamente");
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
    setTimeout(() => setSuccess(null), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    
    const result = await deleteCategory(id);
    if (!result.error) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="max-w-4xl p-6">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-black text-[#1A1A2E] mb-2">Categorías</h1>
        <p className="text-gray-400 font-medium">
          Administra las etiquetas oficiales que los mentores podrán seleccionar en sus talleres.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario Add */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 flex-1 h-fit">
          <div className="flex items-center gap-2 text-[#5A4FCF] font-bold text-sm uppercase tracking-widest mb-6">
            <Tag size={18} /> Nueva Categoría
          </div>
          
          <form onSubmit={handleAdd} className="space-y-6">
            {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 p-4 rounded-xl text-xs font-bold flex gap-2 items-center"><CheckCircle size={14}/> {success}</div>}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nombre de Categoría</label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="Ej. Producción Audiovisual"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#5A4FCF] transition-all outline-none font-bold text-[#1A1A2E]"
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-[#1A1A2E] text-white py-4 rounded-[2rem] font-bold hover:bg-[#5A4FCF] transition-all uppercase tracking-widest text-xs flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Añadir
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-6">Etiquetas Actuales</h3>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-10 bg-gray-50 rounded-3xl">No hay categorías configuradas.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-gray-50 pl-4 py-2 pr-2 rounded-xl flex items-center justify-between gap-4 group hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100">
                  <span className="text-sm font-bold text-[#1A1A2E]">{cat.name}</span>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
