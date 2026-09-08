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
    <main className="min-h-screen bg-background pb-20">
      <Navbar />

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#280732] via-[#320A3F] to-[#1C0425] pt-36 pb-20 px-6 md:px-20 rounded-b-3xl mb-12 text-white">
        <div className="absolute inset-0 opacity-[0.035] noise-bg pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-pink-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[0%] w-[35%] h-[35%] bg-purple-600/25 blur-[110px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 text-center">
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[1.02]">
            Cursos Online de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-pink-300 to-cyan-300">
              Pastelería Profesional.
            </span>
          </h1>
          <p className="text-base md:text-lg text-white/75 max-w-prose mx-auto leading-relaxed">
            Modalidad 100% online organizada por módulos en video, dictada por la Chef Anais Flores. Aprende a tu ritmo, desde cero y con demostraciones técnicas paso a paso.
          </p>
        </div>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
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
            <input
              type="text"
              placeholder="Buscar por técnica, torta o ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-section-alt border border-card-border rounded-2xl text-xs font-semibold text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
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
            <p className="text-muted text-xs max-w-sm mx-auto mb-6">
              No encontramos resultados que coincidan con tu búsqueda. Intenta con otros términos.
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="bg-accent text-white px-5 py-2.5 rounded-xl text-xs font-bold"
            >
              Restablecer Búsqueda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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