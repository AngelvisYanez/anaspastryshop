"use client";
import { m } from "framer-motion";
import { Star, User } from "lucide-react";

const TESTIMONIALS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  text: "TESTIMONIO DEL MIEMBRO — Agrega aquí el testimonio real de uno de tus estudiantes.",
  name: "Nombre del Miembro",
  location: "Ciudad, Estado",
}));

export default function Testimonials() {
  return (
    <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-16"
      >
        <span className="text-accent font-black uppercase tracking-[0.3em] text-xs mb-4 block">
          Lo que dicen los miembros
        </span>
        <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-[0.9]">
          Resultados <span className="text-accent italic">reales</span>
        </h2>
      </m.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <m.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-[2.5rem] p-8 border border-card-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col gap-5"
          >
            <div className="flex gap-1 text-accent">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} size={14} fill="currentColor" />
              ))}
            </div>

            <p className="text-sm text-muted leading-relaxed italic flex-1">
              &ldquo;{t.text}&rdquo;
            </p>

            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-card-border">
              <div className="w-10 h-10 rounded-full bg-accent-subtle border border-card-border flex items-center justify-center">
                <User size={16} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{t.name}</p>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
                  {t.location}
                </p>
              </div>
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
}
