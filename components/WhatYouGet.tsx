"use client";
import { m } from "framer-motion";
import { Radio, BookOpen } from "lucide-react";

const LIVE_FEATURES = [
  "Sesiones dinámicas 100% en vivo",
  "Varios encuentros al mes",
  "Preguntas y respuestas en tiempo real",
  "Grabaciones disponibles para miembros",
];

const MODULE_FEATURES = [
  "Básicos del crédito americano",
  "Construcción y reparación de crédito",
  "Manejo estratégico de deudas",
  "Relación con los bancos",
  "Crédito empresarial",
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
    <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-accent font-black uppercase tracking-[0.3em] text-xs mb-4 block">
          Lo que incluye la academia
        </span>
        <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter mb-16 leading-[0.9]">
          Todo lo que necesitas para{" "}
          <span className="text-accent italic">dominar tu crédito</span>
        </h2>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-[2.5rem] p-10 border border-card-border shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
          >
            <div className="w-12 h-12 bg-accent-subtle rounded-2xl flex items-center justify-center mb-5">
              <Radio size={24} className="text-accent" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3">
              Sesiones en Vivo
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Sesiones prácticas donde puedes traer tus preguntas específicas y
              recibir orientación directa para tu situación.
            </p>
            <ul className="space-y-0">
              {LIVE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 py-2.5 border-b border-card-border last:border-b-0 text-sm text-muted font-medium"
                >
                  <span className="text-accent text-[10px]">✦</span>
                  {f}
                </li>
              ))}
            </ul>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-[2.5rem] p-10 border border-card-border shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
          >
            <div className="w-12 h-12 bg-accent-subtle rounded-2xl flex items-center justify-center mb-5">
              <BookOpen size={24} className="text-accent" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3">
              Módulos Completos
            </h3>
            <p className="text-sm text-muted leading-relaxed mb-6">
              Contenido estructurado desde los básicos hasta estrategias
              avanzadas de crédito personal y empresarial.
            </p>
            <ul className="space-y-0">
              {MODULE_FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-3 py-2.5 border-b border-card-border last:border-b-0 text-sm text-muted font-medium"
                >
                  <span className="text-accent text-[10px]">✦</span>
                  {f}
                </li>
              ))}
            </ul>
          </m.div>
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <div className="w-12 h-0.5 bg-accent mb-6" />
          <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-8">
            Al terminar la academia podrás:
          </p>

          <ul className="space-y-0">
            {RESULTS.map((text, i) => (
              <li
                key={text}
                className="flex items-start gap-4 py-5 border-b border-card-border last:border-b-0"
              >
                <span className="text-2xl font-black text-accent tracking-tighter shrink-0 w-8">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm text-muted font-medium leading-relaxed pt-1">
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </m.div>
      </div>
    </section>
  );
}
