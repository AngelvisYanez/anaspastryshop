"use client";
import { m } from "framer-motion";
import { Play } from "lucide-react";

export default function VideoIntro() {
  return (
    <section className="py-12 px-4 md:px-10 max-w-5xl mx-auto">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-accent font-black uppercase tracking-[0.3em] text-xs mb-10">
          Antes de empezar
        </p>

        <div className="aspect-video bg-card rounded-2xl border border-card-border shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col items-center justify-center gap-4 overflow-hidden">
          <div className="w-16 h-16 rounded-xl bg-accent-subtle flex items-center justify-center">
            <Play size={28} className="text-accent ml-1" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-muted">
            Video introductorio
          </span>
        </div>
      </m.div>
    </section>
  );
}
