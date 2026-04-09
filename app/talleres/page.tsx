"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Clock,
  Loader2,
  Search,
  Filter,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutModal from "@/components/CheckoutModal";

export default function TalleresPage() {
  const [talleres, setTalleres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaller, setSelectedTaller] = useState<any | null>(null);

  // Filtros
  const [activeLevel, setActiveLevel] = useState("Todos");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchTalleres() {
      try {
        const res = await fetch("/api/talleres"); 
        const data = await res.json();
        setTalleres(data);
      } catch (error) {
        console.error("Error fetching talleres:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTalleres();
  }, []);

  const categories = ["Todas", ...Array.from(new Set(talleres.map(t => t.category)))];
  const levels = ["Todos", "Principiante", "Intermedio", "Avanzado"];

  const filteredTalleres = talleres.filter(t => {
    const matchCategory = activeCategory === "Todas" || t.category === activeCategory;
    const matchLevel = activeLevel === "Todos" || t.level === activeLevel;
    const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchLevel && matchSearch;
  });

  return (
    <main className="min-h-screen bg-[#F4F4F7] pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        {/* --- CABECERA --- */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[#5A4FCF] font-bold text-sm uppercase tracking-widest mb-4"
          >
            <Sparkles size={16} /> Catálogo de Experiencias
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black text-[#1A1A2E] tracking-tighter mb-6 leading-none">
            Talleres <br />{" "}
            <span className="text-gray-300 italic">Intensivos.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Aprende haciendo. Sesiones prácticas de un solo día para dominar habilidades específicas con el equipo de Artica.
          </p>
        </div>

        {/* --- CONTROLES: BÚSQUEDA Y FILTROS --- */}
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Buscador */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-[1.5rem] py-5 pl-14 pr-4 shadow-sm focus:ring-2 focus:ring-[#5A4FCF] outline-none transition-all font-bold text-gray-600"
              />
            </div>

            {/* Icono Filtro + Niveles */}
            <div className="flex gap-4 items-center w-full md:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-5 rounded-[1.5rem] border transition-all shadow-sm ${
                  showFilters 
                    ? "bg-[#5A4FCF] text-white border-[#5A4FCF] scale-105" 
                    : "bg-white text-gray-400 border-gray-100 hover:text-[#5A4FCF]"
                }`}
                title="Mostrar categorías"
              >
                <Filter size={20} />
              </button>

              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                {levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`px-8 py-5 rounded-[1.2rem] text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                      activeLevel === level
                        ? "bg-[#1A1A2E] text-white shadow-xl shadow-indigo-100"
                        : "bg-white text-gray-400 hover:bg-gray-50 border border-gray-100"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Barra de Categorías (Expandible) */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeCategory === cat
                          ? "bg-indigo-50 text-[#5A4FCF] border border-indigo-200"
                          : "bg-white text-gray-400 border border-gray-100 hover:text-[#5A4FCF]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- GRID DE TALLERES --- */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#5A4FCF]" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <AnimatePresence>
              {filteredTalleres.map((taller, index) => (
                <motion.div
                  key={taller.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-[3rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all flex flex-col md:flex-row h-full"
                >
                  {/* Imagen del Taller */}
                  <div className="relative w-full md:w-2/5 h-64 md:h-auto overflow-hidden">
                    <Image
                      src={taller.image || "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=800"}
                      alt={taller.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#1A1A2E] shadow-sm">
                        {taller.category}
                      </span>
                    </div>
                  </div>

                  {/* Info del Taller */}
                  <div className="p-10 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-[#5A4FCF] font-bold text-[10px] uppercase tracking-widest">
                        <Clock size={12} /> {new Date(taller.date).toLocaleDateString()}
                      </div>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        {taller.slots} cupos
                      </span>
                    </div>

                    <Link href={`/talleres/${taller.id}`}>
                      <h3 className="text-2xl md:text-3xl font-black text-[#1A1A2E] mb-4 group-hover:text-[#5A4FCF] transition-colors">
                        {taller.title}
                      </h3>
                    </Link>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                        <MapPin size={16} className="text-gray-300" />{" "}
                        {taller.location}
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-sm font-medium">
                        <Users size={16} className="text-gray-300" /> Mentor:{" "}
                        {taller.instructor?.name || "Artica Mentor"}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">
                          Inversión
                        </p>
                        <span className="text-3xl font-black text-[#1A1A2E]">
                          ${taller.price}
                        </span>
                      </div>

                      <div className="flex gap-2 w-full md:w-auto">
                        <Link 
                          href={`/talleres/${taller.id}`}
                          className="bg-gray-100 text-[#1A1A2E] px-6 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all text-center flex-1 md:flex-none"
                        >
                          Ver Detalles
                        </Link>
                        <button 
                          onClick={() => setSelectedTaller(taller)}
                          className="bg-[#1A1A2E] text-white px-6 py-4 rounded-2xl font-bold hover:bg-[#5A4FCF] hover:scale-105 transition-all shadow-xl shadow-indigo-50 flex-1 md:flex-none"
                        >
                          Inscribirme
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* --- NEWSLETTER / CTA --- */}
        <section className="mt-32 bg-[#1A1A2E] rounded-[4rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              ¿Quieres un taller privado?
            </h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto">
              Ofrecemos capacitaciones personalizadas para empresas y equipos en
              Falcón. Potencia a tu personal con Articademy.
            </p>
            <button className="bg-[#5A4FCF] text-white px-10 py-5 rounded-full font-bold hover:bg-white hover:text-[#1A1A2E] transition-all">
              Contactar con Ventas
            </button>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#5A4FCF]/20 blur-[120px] rounded-full" />
        </section>
      </div>

      <Footer />

      {/* MODAL DE PAGO */}
      {selectedTaller && (
        <CheckoutModal
          isOpen={!!selectedTaller}
          onClose={() => setSelectedTaller(null)}
          title={selectedTaller.title}
          price={selectedTaller.price}
          tallerId={selectedTaller.id}
        />
      )}
    </main>
  );
}

