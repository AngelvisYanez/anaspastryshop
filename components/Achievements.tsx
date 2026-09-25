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
    <section className="w-full relative overflow-hidden bg-gradient-to-b from-brand-purple-deep via-brand-purple-mid to-brand-purple py-24 border-t border-white/10">
      <div className="absolute inset-0 opacity-[0.03] noise-bg pointer-events-none" />
      <div className="absolute -top-20 right-1/4 w-96 h-96 bg-purple-500/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-pink-500/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 relative z-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-black text-on-purple tracking-tight mb-4">
            Lo que serás capaz de lograr al{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-pink-200 to-purple-300">
              finalizar tu capacitación
            </span>
          </h2>
          <p className="text-on-purple-soft text-base font-medium">
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
              className={`w-[85vw] max-w-md shrink-0 sm:w-auto bg-glass border border-glass-border rounded-2xl p-6 flex items-start gap-4 shadow-lg shadow-black/20 hover:border-white/30 hover:shadow-xl transition-all ${
                i === ACHIEVEMENTS.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 text-on-purple-accent flex items-center justify-center shrink-0">
                <item.icon size={20} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-on-purple mb-1.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-on-purple-soft leading-relaxed">{item.text}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}