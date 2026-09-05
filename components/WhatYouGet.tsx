"use client";
import { m } from "framer-motion";
import { Radio, BookOpen, Users } from "lucide-react";

const CARDS = [
  {
    icon: Radio,
    title: "Sesiones en Vivo",
    description:
      "Sesiones prácticas donde puedes traer tus dudas específicas y recibir orientación directa de instructores expertos.",
    features: [
      "Sesiones dinámicas 100% en vivo",
      "Varios encuentros al mes",
      "Preguntas y respuestas en tiempo real",
      "Grabaciones disponibles para miembros",
    ],
  },
  {
    icon: BookOpen,
    title: "Cursos Completos",
    description:
      "Contenido estructurado desde los fundamentos hasta niveles avanzados, con proyectos y ejercicios reales.",
    features: [
      "Ruta de aprendizaje clara",
      "Proyectos prácticos paso a paso",
      "Material descargable exclusivo",
      "Seguimiento de tu progreso",
    ],
  },
  {
    icon: Users,
    title: "Comunidad & Recursos",
    description:
      "Una comunidad activa que aprende junta, con material exclusivo y actualizaciones constantes para estar siempre al día.",
    features: [
      "Comunidad activa de miembros",
      "Actualizaciones en tiempo real",
      "Material exclusivo descargable",
      "Soporte entre pares",
    ],
  },
];

const RESULTS = [
  "Dominar las herramientas digitales esenciales para tu campo profesional.",
  "Aplicar lo aprendido en proyectos reales desde las primeras semanas.",
  "Entender los fundamentos y las estrategias avanzadas de cada tema.",
  "Trabajar de forma más eficiente y productiva con los recursos adecuados.",
  "Construir un portafolio y una base de conocimiento sólida.",
  "Adaptarte con confianza a un mundo digital que cambia constantemente.",
  "Seguir aprendiendo y creciendo con contenido siempre actualizado.",
];

export default function WhatYouGet() {
  return (
    <section className="w-full bg-foreground py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
            Lo que incluye la academia
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-black text-background tracking-tight leading-[0.95]">
            Todo lo que necesitas para{" "}
            <span className="text-accent">dominar tus habilidades</span>
          </h2>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <m.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-card rounded-xl p-8 border border-card-border flex flex-col"
              >
                <div className="w-11 h-11 bg-accent-subtle rounded-lg flex items-center justify-center mb-5 shrink-0">
                  <Icon size={20} className="text-accent" />
                </div>
                <h3 className="font-display text-xl font-black text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed mb-6">
                  {card.description}
                </p>
                <ul className="space-y-0 mt-auto">
                  {card.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 py-2.5 border-b border-card-border last:border-b-0 text-xs text-muted"
                    >
                      <span className="text-accent text-[10px] shrink-0">✦</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </m.div>
            );
          })}
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-0.5 bg-accent" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
              Al terminar la academia podrás:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
            {RESULTS.map((text, i) => (
              <m.div
                key={text}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex items-start gap-5 py-5 border-b border-background/[0.12]"
              >
                <span className="font-display text-3xl font-black text-accent tracking-tight shrink-0 w-12 leading-none mt-0.5 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-background/55 leading-relaxed pt-1">
                  {text}
                </p>
              </m.div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
