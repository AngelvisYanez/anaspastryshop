"use client";
import { motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="px-4 md:px-10 pt-24">
      <div className="relative overflow-hidden bg-white rounded-[3.5rem] min-h-[85vh] flex flex-col items-center justify-center text-center p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-gray-100/50">
        {/* Luces de Fondo (Glows) */}
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-purple-200/40 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-indigo-100/40 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Inscripciones Abiertas - LATAM & Online
            </span>
          </div>

          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-[#1A1A2E] mb-8 leading-[0.85]">
            Donde el talento <br />
            <span className="text-gray-300 italic font-serif">
              encuentra su voz.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Formación profesional impulsada por{" "}
            <span className="text-[#5A4FCF]">4101 Media</span> &{" "}
            <span className="text-[#5A4FCF]">Articademy</span>. Aprende
            producción, marketing y código con proyectos reales.
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <button className="bg-[#1A1A2E] text-white px-10 py-5 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-2xl shadow-indigo-200/50">
              Explorar Cursos <ArrowUpRight size={20} />
            </button>
            <button className="bg-white text-[#1A1A2E] px-10 py-5 rounded-full font-bold border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2">
              <Play size={18} fill="currentColor" /> Ver Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
