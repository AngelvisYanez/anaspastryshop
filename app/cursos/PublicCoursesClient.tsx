"use client";

import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormacionCard, { type FormacionCardData } from "@/components/FormacionCard";
import * as m from "framer-motion/m";

export interface Course extends FormacionCardData {}

export default function PublicCoursesClient({
  initialCourses,
}: {
  initialCourses: Course[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      const query = searchQuery.toLowerCase().trim();
      return (
        !query ||
        course.title.toLowerCase().includes(query) ||
        (course.description || "").toLowerCase().includes(query) ||
        (course.category || "").toLowerCase().includes(query)
      );
    });
  }, [initialCourses, searchQuery]);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="relative overflow-hidden bg-brand-purple pt-28 pb-14 xl:pt-36 xl:pb-16 mb-10 text-white">
        <div className="relative z-10 page-container text-center max-w-3xl mx-auto">
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-4 leading-[1.12]">
            Cursos Online de{" "}
            <span className="text-on-purple-accent">Pastelería Profesional</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/85 leading-relaxed">
            Modalidad 100% online por módulos en video, con Anais Flores. Aprende a tu ritmo, desde cero y con demostraciones paso a paso.
          </p>
        </div>
      </div>

      <div className="page-container pb-16 sm:pb-20">
        {/* Search + Counter */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 bg-card border border-card-border p-4 rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-xs text-muted px-2">
            <span>
              Mostrando <strong>{filteredCourses.length}</strong> de{" "}
              {initialCourses.length} cursos online disponibles
            </span>
          </div>

          <div className="relative min-w-[280px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <label htmlFor="public-courses-search" className="sr-only">Buscar cursos por técnica, torta o ingrediente</label>
            <input
              id="public-courses-search"
              type="text"
              placeholder="Buscar por técnica, torta o ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-section-alt border border-card-border rounded-2xl text-xs font-semibold text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda de cursos"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-card border border-card-border rounded-3xl p-8">
            <Filter size={36} className="mx-auto text-muted mb-4 opacity-50" />
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              No se encontraron cursos online
            </h3>
            <p className="text-muted text-xs max-w-sm mx-auto mb-4 sm:mb-6">
              No encontramos resultados que coincidan con tu búsqueda. Intenta con otros términos.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="bg-accent-solid text-white px-5 py-2.5 rounded-xl text-xs font-bold"
            >
              Restablecer Búsqueda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredCourses.map((course) => (
              <m.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FormacionCard course={course} />
              </m.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}