"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#F4F4F7] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Navbar para que no se sientan atrapados */}
      <Navbar />

      {/* Elementos decorativos de fondo (Glows) */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5A4FCF]/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/20 blur-[120px] rounded-full animate-pulse" />

      <div className="z-10 text-center max-w-2xl">
        {/* Animación del número 404 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-[12rem] md:text-[18rem] font-black leading-none tracking-tighter text-[#1A1A2E] opacity-5 select-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 -z-10">
            404
          </h1>

          <div className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-indigo-100 mb-8 border border-white">
            <Search size={48} className="text-[#5A4FCF]" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-[#1A1A2E] mb-6 tracking-tight">
            Oops... Te perdiste en el{" "}
            <span className="text-gray-300 italic">metaverso.</span>
          </h2>

          <p className="text-lg text-gray-500 mb-12 leading-relaxed">
            Parece que el link que buscas se fue de pasantías a **Artica Group**
            en Miami o simplemente no existe. No te preocupes, el camino a la
            formación sigue abierto.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <button className="bg-[#1A1A2E] text-white px-10 py-5 rounded-full font-bold flex items-center gap-2 hover:bg-black transition-all shadow-2xl shadow-indigo-200/50 group">
                <Home size={18} /> Volver al Inicio
              </button>
            </Link>

            <Link href="/cursos">
              <button className="bg-white text-[#1A1A2E] px-10 py-5 rounded-full font-bold border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2">
                <Sparkles size={18} className="text-[#5A4FCF]" /> Ver Cursos
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Mensaje Witty final */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-20 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-[0.2em]"
        >
          <div className="w-8 h-px bg-gray-200" />
          Error 404 | Articademy
          <div className="w-8 h-px bg-gray-200" />
        </motion.div>
      </div>

      {/* Footer solo si quieres que se vea abajo, opcional en 404 */}
    </main>
  );
}
