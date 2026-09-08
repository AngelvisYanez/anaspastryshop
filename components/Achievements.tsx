"use client";
import { m } from "framer-motion";
import { Cake, Droplet, Flame, Palette, Calculator, Lightbulb } from "lucide-react";

const ACHIEVEMENTS = [
  {
    icon: Cake,
    title: "Bizcochos Esponjosos",
    text: "Húmedos y con estructura firme, sin depender de premezclas.",
  },
  {
    icon: Droplet,
    title: "Cremas y Coberturas Estables",
    text: "Acabado terso y bordes limpios, resistentes al clima.",
  },
  {
    icon: Flame,
    title: "Horneado a Fondo",
    text: "Dominar tiempos, temperaturas precisas, leudado y texturas perfectas.",
  },
  {
    icon: Palette,
    title: "Decoración Avanzada",
    text: "Técnicas con base giratoria y herramientas profesionales.",
  },
  {
    icon: Calculator,
    title: "Costos y Precios Rentables",
    text: "Calcula costos reales de producción y fija precios para emprender.",
  },
  {
    icon: Lightbulb,
    title: "Recetas de Autor",
    text: "Gana la seguridad necesaria para crear tus propias recetas y combinaciones.",
  },
];

export default function Achievements() {
  return (
    <section className="w-full bg-gradient-to-b from-[#25072F] via-[#350A43] to-[#1C0425] py-24 border-t border-white/10">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Lo que serás capaz de lograr al{" "}
            <span className="text-pink-400">finalizar tu capacitación</span>
          </h2>
          <p className="text-white/70 text-base font-medium">
            Cada técnica y método está diseñado para que termines el taller con resultados reales y aplicables desde el primer día.
          </p>
        </m.div>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 overflow-x-auto pb-2 scrollbar-hide">
          {ACHIEVEMENTS.map((item, i) => (
            <m.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`w-[85vw] max-w-md shrink-0 sm:w-auto bg-white/[0.05] border border-white/10 rounded-2xl p-6 flex items-start gap-4 hover:border-pink-400/40 hover:bg-white/[0.08] transition-colors ${
                i === ACHIEVEMENTS.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-pink-500/20 border border-pink-400/30 text-pink-300 flex items-center justify-center shrink-0">
                <item.icon size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white mb-1.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed">{item.text}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}