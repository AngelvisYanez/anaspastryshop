"use client";
import { m } from "framer-motion";
import { Globe } from "lucide-react";

export default function Features() {
  return (
    <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <m.div
          whileHover={{ y: -5 }}
          className="md:col-span-12 bg-navy text-white rounded-xl p-12 flex flex-col justify-between min-h-[450px] border border-white/5"
        >
          <div>
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <Globe className="text-white" size={28} />
            </div>
            <h3 className="text-3xl font-bold mb-4 leading-tight">
              Presencia en Latinoamérica
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
            <div className="bg-accent w-10 h-10 rounded-full flex items-center justify-center italic font-serif text-lg text-navy">
              A
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
