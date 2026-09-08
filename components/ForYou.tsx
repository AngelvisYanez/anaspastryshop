"use client";
import { useRef, useState, useEffect } from "react";
import { m } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SITUATIONS = [
  "Quieres aprender pastelería y repostería desde cero, sin importar que nunca antes hayas tocado un horno.",
  "Te frustra que las recetas de internet unas veces funcionen y otras fallen, sin saber la técnica correcta ni cómo corregirlas.",
  "Deseas dominar técnicas de decoración en tendencia, bordes perfectos y montaje seguro de varios pisos.",
  "Quieres emprender tu propio negocio de pastelería con recetas estandarizadas, estables y rentables.",
  "Buscas una experiencia 100% práctica y presencial de 8 horas con asesoría directa y acompañamiento paso a paso.",
  "Quieres comprender a fondo el comportamiento de los ingredientes: grasas, harinas, puntos de batido y temperaturas de horneado.",
  "Deseas perfeccionar la elaboración de panes artesanales, fermentaciones y masas que sorprendan por su textura.",
  "Buscas capacitarte en un ambiente cómodo, cercano y profesional donde cada duda se responde en tiempo real.",
  "Valoras capacitarte con una instructora profesional dedicada a enseñarte con paciencia, cercanía y métodos probados.",
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
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight">
              ¿Es para ti? Está diseñado para quienes desean{" "}
              <span className="text-accent">formarse de verdad</span>
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canPrev}
              aria-label="Anterior"
              className="w-12 h-12 rounded-full border border-card-border bg-card flex items-center justify-center text-foreground hover:bg-card-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canNext}
              aria-label="Siguiente"
              className="w-12 h-12 rounded-full border border-card-border bg-card flex items-center justify-center text-foreground hover:bg-card-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </m.div>

        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4"
        >
          {SITUATIONS.map((sit, i) => (
            <div
              key={i}
              className="min-w-[280px] sm:min-w-[340px] max-w-[360px] snap-start bg-card rounded-2xl p-7 border border-card-border flex flex-col justify-between shadow-sm hover:border-accent/40 transition-colors"
            >
              <p className="text-sm text-foreground/80 leading-relaxed font-medium mb-6">
                &ldquo;{sit}&rdquo;
              </p>
              <span className="text-xs font-bold text-accent">
                Ana&apos;s Pastry Shop es para ti →
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
