"use client";
import { m } from "framer-motion";

const SITUATIONS = [
  "Has intentado aplicar a un crédito para tu casa, carro o negocio y te lo han negado sin entender por qué.",
  "Te acaba de llegar el Social Security Number o tienes menos de 5 años con él y todavía no sabes cómo aprovecharlo.",
  "Sientes que el sistema financiero americano es una caja negra y no sabes cómo usarlo a tu favor.",
  "Tienes deudas que no sabes cómo manejar y el mínimo no alcanza para pagarlas.",
  "No sabes cómo mejorar tu puntaje de crédito ni qué factores lo están bajando.",
  "Pagas tasas de interés demasiado altas en tus tarjetas o préstamos porque nadie te ha explicado cómo negociar mejores condiciones.",
  "Te sientes confundido con el lenguaje bancario y firmas documentos sin entender completamente lo que aceptas.",
  "Quieres comprar una casa o un carro pero tu puntaje no está donde necesita estar para conseguir buenas condiciones.",
  "Te han negado tarjetas de crédito constantemente y no sabes cuál es el problema ni cómo resolverlo.",
];

export default function ForYou() {
  return (
    <section id="para-ti" className="w-full bg-section-alt py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
            Esta academia es para ti si…
          </span>
          <h2 className="font-display text-4xl md:text-6xl font-black text-foreground tracking-tight mb-16 leading-[0.9]">
            ¿Te identificas con{" "}
            <span className="text-accent italic">
              alguna de estas situaciones?
            </span>
          </h2>
        </m.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-card-border rounded-[2.5rem] overflow-hidden border border-card-border">
          {SITUATIONS.map((text, i) => (
            <m.div
              key={text}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card p-8 hover:bg-card-hover transition-colors group cursor-default"
            >
              <div className="font-display text-4xl font-black text-accent/20 italic leading-none mb-5 group-hover:text-accent/40 transition-colors">
                {String(i + 1).padStart(2, "0")}
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {text}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
