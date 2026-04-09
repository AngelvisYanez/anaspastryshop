"use client";
import { motion } from "framer-motion";
import { Users, Globe } from "lucide-react";

export default function Features() {
  return (
    <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Card: Pasantías */}
        <motion.div
          whileHover={{ y: -5 }}
          className="md:col-span-8 bg-[#E8E8FF] rounded-[2.5rem] p-12 flex flex-col justify-between min-h-[450px] relative overflow-hidden group border border-indigo-100"
        >
          <div className="z-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm text-[#5A4FCF]">
              <Users size={28} />
            </div>
            <h3 className="text-4xl font-bold text-[#1A1A2E] mb-4 leading-tight">
              Pasantías de <br /> Alto Impacto
            </h3>
            <p className="text-gray-600 text-lg max-w-xs leading-relaxed">
              Trabaja codo a codo con nuestro equipo en proyectos reales para
              marcas de Latinoamérica y EEUU.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] text-[180px] md:text-[220px] font-black text-white/50 select-none group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            Artica
          </div>
        </motion.div>

        {/* Card: Ubicación Latinoamérica */}
        <motion.div
          whileHover={{ y: -5 }}
          className="md:col-span-4 bg-[#1A1A2E] text-white rounded-[2.5rem] p-12 flex flex-col justify-between min-h-[450px] border border-white/5"
        >
          <div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Globe className="text-white" size={28} />
            </div>
            <h3 className="text-3xl font-bold mb-4 leading-tight">
              Talleres en Latinoamérica
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Espacios físicos diseñados para el aprendizaje presencial,
              networking y producción real.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-end">
            <div>
              <span className="block text-xs text-gray-500 uppercase font-bold tracking-[0.2em] mb-1">
                Ubicación
              </span>
              <span className="text-xl font-semibold">Latinoamérica</span>
            </div>
            <div className="bg-[#5A4FCF] w-10 h-10 rounded-full flex items-center justify-center italic font-serif text-lg">
              A
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
