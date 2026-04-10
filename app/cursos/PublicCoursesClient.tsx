"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Monitor, MapPin, ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Definimos niveles en lugar de categorías para el filtrado, ya que Prisma schema de cursos tiene 'level' pero no una Category model propia relacional en esta iteración.
const LEVELS = ["Todos", "Principiante", "Intermedio", "Avanzado"];

type CourseProps = {
  id: string;
  title: string;
  instructor: string;
  price: number;
  type: string;
  level: string;
  category: string;
  image: string;
  hasAccess?: boolean;
};

export default function PublicCoursesClient({ 
  courses, 
  userSubscription 
}: { 
  courses: CourseProps[], 
  userSubscription?: { plan: string, status: string } | null 
}) {
  const [activeLevel, setActiveLevel] = useState("Todos");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Extraer categorías dinámicas
  const categories = ["Todas", ...Array.from(new Set(courses.map(c => c.category)))];

  const filteredCourses = courses.filter((course) => {
    const matchesLevel = activeLevel === "Todos" || course.level === activeLevel;
    const matchesCategory = activeCategory === "Todas" || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#F4F4F7] pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        {/* --- HEADER DEL MÓDULO --- */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[#5A4FCF] font-bold text-sm uppercase tracking-widest mb-4"
          >
            <Sparkles size={16} /> Catálogo de Formación
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold text-[#1A1A2E] tracking-tighter mb-6">
            Lleva tu talento al <br /> <span className="text-gray-400">siguiente nivel.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl leading-relaxed">
            Formación técnica de alto nivel respaldada por 4101 Media y Artica Group.
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
                {LEVELS.map((level) => (
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

        {/* --- GRID DE CURSOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((curso) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={curso.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100 flex flex-col h-full group"
              >
                <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={curso.image}
                    alt={curso.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-5 left-5">
                    <span
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm flex items-center gap-1.5 ${
                        curso.type === "Online"
                          ? "bg-blue-500/20 text-blue-700"
                          : "bg-orange-500/20 text-orange-700"
                      }`}
                    >
                      {curso.type === "Online" ? <Monitor size={12} /> : <MapPin size={12} />}
                      {curso.type}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#5A4FCF] text-[10px] font-black uppercase tracking-[0.2em]">
                      {curso.level}
                    </span>
                    {curso.hasAccess && (
                      <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                        <Zap size={10} className="fill-current" /> Desbloqueado
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1A2E] mb-2 leading-tight">
                    {curso.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-8">
                    <p className="text-gray-400 text-sm font-medium">
                      Tutor Guía: {curso.instructor}
                    </p>
                    {!curso.hasAccess && userSubscription?.status === "ACTIVE" && (
                      <span className="text-[9px] font-bold text-orange-400 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
                        Requiere Upgrade
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-black text-[#1A1A2E]">${curso.price}</span>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-1 italic">
                        Zelle • USDT • Bolívares
                      </p>
                    </div>

                    <Link href={`/cursos/${curso.id}`}>
                      <button className="bg-[#1A1A2E] text-white p-4 rounded-2xl hover:bg-[#5A4FCF] hover:scale-110 transition-all shadow-lg shadow-indigo-50">
                        <ArrowRight size={22} />
                      </button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold text-xl">
              Catálogo actualizándose próximamente.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
