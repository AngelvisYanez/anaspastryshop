"use client";
import { m } from "framer-motion";
import { Cake, BookOpen, Palette, CheckCircle2 } from "lucide-react";

const CARDS = [
  {
    icon: Cake,
    title: "Workshops Presenciales Intensivos",
    description:
      "Jornadas de 8 horas continuas (9:00 AM a 5:00 PM) con práctica individual desde cero en un ambiente completamente equipado.",
    features: [
      "Práctica 100% individual",
      "Insumos de primera calidad incluidos",
      "Te llevas tus creaciones a casa",
      "Cupos reducidos para atención cercana",
    ],
  },
  {
    icon: BookOpen,
    title: "Técnicas & Métodos Exactos",
    description:
      "Aprende el porqué de cada paso: puntos de batido, temperaturas, hidratación y cómo evitar errores comunes para que tus recetas siempre salgan perfectas.",
    features: [
      "El porqué de cada ingrediente",
      "Técnicas infalibles de horneado",
      "Cómo rescatar cremas y masas",
      "Estandarización y rendimientos",
    ],
  },
  {
    icon: Palette,
    title: "Decoración & Tendencias",
    description:
      "Domina el manejo de la base giratoria, alisados prolijos, bordes perfectos y técnicas decorativas modernas.",
    features: [
      "Bordes afilados y texturas en tendencia",
      "Manejo de mangas y boquillas",
      "Estructuras y montaje seguro",
      "Presentación lista para la venta",
    ],
  },
];

export default function WhatYouGet() {
  return (
    <section className="w-full relative overflow-hidden bg-brand-purple py-20 md:py-24 text-on-purple">
      <div className="page-container relative z-10">
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 md:mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-black text-on-purple tracking-tight leading-[1.1] max-w-3xl">
            Todo lo que incluye{" "}
            <span className="text-on-purple-accent">tu experiencia formativa</span>
          </h2>
          <p className="text-on-purple-soft max-w-2xl mt-4 text-base md:text-lg">
            Combinamos práctica intensiva individual, recetas comprobadas y acompañamiento cercano para que aprendas con total seguridad.
          </p>
        </m.div>

        <div className="flex md:grid md:grid-cols-3 gap-5 md:gap-8 overflow-x-auto pb-2 scrollbar-hide">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <m.div
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="w-[85vw] max-w-sm shrink-0 md:w-auto md:shrink-0 border border-glass-border rounded-2xl p-7 md:p-8 flex flex-col justify-between bg-white/[0.04]"
              >
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-on-purple-accent shrink-0">
                      <Icon size={22} />
                    </div>
                    <h3 className="font-display text-lg md:text-xl font-black text-on-purple tracking-tight">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-on-purple-soft text-sm leading-relaxed mb-5">
                    {card.description}
                  </p>
                </div>
                <ul className="space-y-2.5 pt-5 border-t border-white/15">
                  {card.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-on-purple-soft font-medium">
                      <CheckCircle2 size={15} className="text-on-purple-accent shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
