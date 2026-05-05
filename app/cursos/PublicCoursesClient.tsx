"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Search, Filter, Monitor, MapPin, ArrowRight, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  userSubscription,
}: {
  courses: CourseProps[];
  userSubscription?: { plan: string; status: string } | null;
}) {
  const [activeLevel, setActiveLevel] = useState("Todos");
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["Todas", ...Array.from(new Set(courses.map((c) => c.category)))];

  const filteredCourses = courses.filter((course) => {
    const matchesLevel = activeLevel === "Todos" || course.level === activeLevel;
    const matchesCategory = activeCategory === "Todas" || course.category === activeCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-background pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mb-4"
          >
            <Sparkles size={14} /> Catálogo de Formación
          </m.div>
          <h1 className="font-display text-5xl md:text-7xl font-black text-foreground tracking-tight mb-6 leading-[0.9]">
            Lleva tu conocimiento al{" "}
            <span className="text-accent italic">siguiente nivel.</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl leading-relaxed">
            Formación de alto nivel en crédito y finanzas respaldada por Academia Credito USA.
          </p>
        </div>

        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card border border-card-border rounded-full py-4 pl-13 pr-5 focus:outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium"
              />
            </div>

            <div className="flex gap-3 items-center w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-4 rounded-full border transition-all ${
                  showFilters
                    ? "bg-accent text-[#0B1F3A] border-accent"
                    : "bg-card text-muted border-card-border hover:text-accent hover:border-accent"
                }`}
                title="Mostrar categorías"
              >
                <Filter size={18} />
              </button>

              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
                      activeLevel === level
                        ? "bg-foreground text-background border-foreground"
                        : "bg-card text-muted border-card-border hover:border-accent hover:text-accent"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <m.div
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
                      className={`px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                        activeCategory === cat
                          ? "bg-accent-subtle text-accent border-accent/30"
                          : "bg-card text-muted border-card-border hover:text-accent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCourses.map((curso) => (
              <m.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={curso.id}
                whileHover={{ y: -8 }}
                className="bg-card rounded-[2.5rem] overflow-hidden border border-card-border flex flex-col h-full group"
              >
                <div className="relative h-60 w-full bg-section-alt overflow-hidden">
                  <Image
                    src={curso.image}
                    alt={curso.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md flex items-center gap-1.5 ${
                        curso.type === "Online"
                          ? "bg-foreground/80 text-background"
                          : "bg-accent/90 text-[#0B1F3A]"
                      }`}
                    >
                      {curso.type === "Online" ? <Monitor size={11} /> : <MapPin size={11} />}
                      {curso.type}
                    </span>
                  </div>
                </div>

                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-accent text-[10px] font-bold uppercase tracking-[0.2em]">
                      {curso.level}
                    </span>
                    {curso.hasAccess && (
                      <span className="bg-accent-subtle text-accent text-[9px] font-bold uppercase px-2 py-1 rounded-lg border border-accent/20 flex items-center gap-1">
                        <Zap size={10} className="fill-current" /> Desbloqueado
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-black text-foreground mb-2 leading-tight">
                    {curso.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-6">
                    <p className="text-muted text-sm">
                      {curso.instructor}
                    </p>
                    {!curso.hasAccess && userSubscription?.status === "ACTIVE" && (
                      <span className="text-[9px] font-bold text-accent bg-accent-subtle px-2 py-0.5 rounded-md border border-accent/20">
                        Requiere Upgrade
                      </span>
                    )}
                  </div>

                  <div className="mt-auto pt-5 border-t border-card-border flex items-center justify-between">
                    <div>
                      <span className="font-display text-3xl font-black text-foreground italic">${curso.price}</span>
                      <p className="text-[9px] text-muted font-bold uppercase tracking-tighter mt-0.5">
                        Zelle · USDT · Bolívares
                      </p>
                    </div>

                    <Link href={`/cursos/${curso.id}`}>
                      <button className="bg-foreground text-background p-4 rounded-2xl hover:bg-accent hover:text-[#0B1F3A] hover:scale-110 transition-all shadow-sm">
                        <ArrowRight size={20} />
                      </button>
                    </Link>
                  </div>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-24 bg-card rounded-[3rem] border border-dashed border-card-border">
            <p className="font-display text-xl font-black text-muted italic">
              Catálogo actualizándose próximamente.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
