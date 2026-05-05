"use client";
import { m } from "framer-motion";
import { Radio, BookOpen, Users } from "lucide-react";

const CARDS = [
  {
    icon: Radio,
    title: "Sesiones en Vivo",
    description:
      "Sesiones prácticas donde puedes traer tus preguntas específicas y recibir orientación directa para tu situación.",
    features: [
      "Sesiones dinámicas 100% en vivo",
      "Varios encuentros al mes",
      "Preguntas y respuestas en tiempo real",
      "Grabaciones disponibles para miembros",
    ],
  },
  {
    icon: BookOpen,
    title: "Módulos Completos",
    description:
      "Contenido estructurado desde los básicos hasta estrategias avanzadas de crédito personal y empresarial.",
    features: [
      "Básicos del crédito americano",
      "Construcción y reparación de crédito",
      "Manejo estratégico de deudas",
      "Relación con los bancos",
      "Crédito empresarial",
    ],
  },
  {
    icon: Users,
    title: "Comunidad & Recursos",
    description:
      "Una comunidad activa de hispanohablantes que aprenden juntos, con material exclusivo y actualizaciones constantes.",
    features: [
      "Comunidad activa de miembros",
      "Actualizaciones en tiempo real",
      "Material exclusivo descargable",
      "Soporte entre pares",
    ],
  },
];

const RESULTS = [
  "Entender el sistema crediticio americano y usarlo estratégicamente a tu favor.",
  "Leer e interpretar tu reporte de crédito e identificar errores que te están costando puntos.",
  "Aplicar estrategias concretas para subir tu puntaje, incluso si tienes historial dañado.",
  "Manejar tus deudas de forma inteligente y salir del ciclo de pagos mínimos.",
  "Construir una relación sólida con los bancos que te dé acceso a mejor financiamiento.",
  "Calificar para las mejores condiciones en hipotecas, préstamos de auto y tarjetas de crédito.",
  "Usar tu crédito como herramienta para invertir y generar patrimonio — dentro y fuera de Estados Unidos.",
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
            <span className="text-accent">dominar tu crédito</span>
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
