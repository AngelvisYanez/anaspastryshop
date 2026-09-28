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
    <section className="w-full relative overflow-hidden bg-background py-20 md:py-24 border-t border-card-border">
      <div className="page-container relative z-10">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-12 md:mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-black text-foreground tracking-tight mb-4">
            Lo que serás capaz de lograr al{" "}
            <span className="text-accent">finalizar tu capacitación</span>
          </h2>
          <p className="text-muted text-base font-medium">
            Cada técnica y método está diseñado para que termines el taller con resultados reales y aplicables desde el primer día.
          </p>
        </m.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
          {ACHIEVEMENTS.map((item, i) => (
            <m.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center shrink-0">
                <item.icon size={18} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{item.text}</p>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
