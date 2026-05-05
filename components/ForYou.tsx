"use client";
import { useRef, useState, useEffect } from "react";
import { m } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateButtons = () => {
    if (!ref.current) return;
    setCanPrev(ref.current.scrollLeft > 0);
    setCanNext(ref.current.scrollLeft + ref.current.offsetWidth < ref.current.scrollWidth - 4);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons, { passive: true });
    updateButtons();
    return () => el.removeEventListener("scroll", updateButtons);
  }, []);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const cardWidth = ref.current.querySelector("div")?.offsetWidth ?? 320;
    ref.current.scrollBy({ left: dir === "right" ? cardWidth + 16 : -(cardWidth + 16), behavior: "smooth" });
  };

  return (
    <section id="para-ti" className="w-full bg-section-alt py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12"
        >
          <div>
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
              Esta academia es para ti si…
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-black text-foreground tracking-tight leading-[0.95]">
              ¿Te identificas con{" "}
              <span className="text-accent">
                alguna de estas situaciones?
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canPrev}
              className="w-11 h-11 rounded-xl border border-card-border bg-card flex items-center justify-center hover:bg-card-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canNext}
              className="w-11 h-11 rounded-xl border border-card-border bg-card flex items-center justify-center hover:bg-card-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Siguiente"
            >
              <ChevronRight size={20} className="text-foreground" />
            </button>
          </div>
        </m.div>

        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {SITUATIONS.map((text, i) => (
            <m.div
              key={text}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex-none w-[300px] md:w-[340px] bg-card border border-card-border rounded-2xl p-8 hover:bg-card-hover transition-colors group cursor-default"
            >
              <div className="font-display text-5xl font-black text-navy leading-none mb-6 tabular-nums">
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
