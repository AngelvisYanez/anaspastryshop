"use client";
import { useState } from "react";
import { m } from "framer-motion";
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
    if (!confirm("Â¿Seguro que deseas eliminar esta categorÃ­a?")) return;
    
    const result = await deleteCategory(id);
    if (!result.error) {
      setCategories(categories.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="max-w-4xl p-6">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl font-black text-[#0B1F3A] mb-2">Categorías</h1>
        <p className="text-gray-400 font-medium">
          Administra las etiquetas oficiales que los mentores podrÃ¡n seleccionar en sus cursos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario Add */}
        <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-gray-100 flex-1 h-fit">
          <div className="flex items-center gap-2 text-[#C9A84C] font-bold text-sm uppercase tracking-widest mb-6">
            <Tag size={18} /> Nueva Categoría
          </div>
          
          <form onSubmit={handleAdd} className="space-y-6">
            {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 p-4 rounded-xl text-xs font-bold flex gap-2 items-center"><CheckCircle size={14}/> {success}</div>}
            
            <div className="space-y-2">
              <label htmlFor="cat-name" className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nombre de Categoría</label>
              <input id="cat-name" 
                type="text" 
                name="name" 
                required 
                placeholder="Ej. Producción Audiovisual"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#C9A84C] transition-all outline-none font-bold text-[#0B1F3A]"
              />
            </div>
            
            <button 
              disabled={loading}
              className="w-full bg-[#0B1F3A] text-white py-4 rounded-[2rem] font-bold hover:bg-[#C9A84C] transition-all uppercase tracking-widest text-xs flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              AÃ±adir
            </button>
          </form>
        </div>

        {/* Lista */}
        <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-[#0B1F3A] mb-6">Etiquetas Actuales</h3>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-400 italic text-center py-10 bg-gray-50 rounded-3xl">No hay categorÃ­as configuradas.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-gray-50 pl-4 py-2 pr-2 rounded-xl flex items-center justify-between gap-4 group hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-200">
                  <span className="text-sm font-bold text-[#0B1F3A]">{cat.name}</span>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
