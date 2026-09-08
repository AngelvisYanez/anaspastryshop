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
    <section className="w-full bg-gradient-to-b from-[#2B0938] via-[#24062E] to-[#1C0524] py-24 text-white">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight leading-[1.05]">
            Todo lo que incluye{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300">
              tu experiencia formativa
            </span>
          </h2>
          <p className="text-white/70 max-w-2xl mt-4 text-base md:text-lg">
            Combinamos práctica intensiva individual, recetas comprobadas y acompañamiento cercano para que aprendas con total seguridad.
          </p>
        </m.div>

        <div className="flex md:grid md:grid-cols-3 gap-5 md:gap-8 overflow-x-auto pb-2 scrollbar-hide">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <m.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="w-[85vw] max-w-sm shrink-0 md:w-auto md:shrink-0 bg-white/[0.05] border border-white/10 rounded-3xl p-8 backdrop-blur hover:border-pink-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-pink-500/20 border border-pink-400/30 flex items-center justify-center text-pink-300 shrink-0">
                      <Icon size={26} />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-black text-white tracking-tight">
                      {card.title}
                    </h3>
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed mb-6">
                    {card.description}
                  </p>
                </div>
                <ul className="space-y-3 pt-6 border-t border-white/10">
                  {card.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-xs text-white/80 font-medium">
                      <CheckCircle2 size={16} className="text-accent shrink-0" />
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
