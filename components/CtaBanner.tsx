"use client";
import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="py-24 px-4 md:px-10 max-w-5xl mx-auto">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-navy rounded-[3.5rem] p-12 md:p-20 text-center relative overflow-hidden"
      >
        <div className="absolute top-[-15%] right-[-10%] w-80 h-80 bg-accent/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-5 leading-[0.95]">
            El conocimiento sin acción{" "}
            <span className="text-accent italic">no cambia nada.</span>
          </h2>

          <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Empieza hoy. Aprende a tu ritmo. Accede a sesiones en vivo, módulos
            completos, y una comunidad que se actualiza constantemente con las
            últimas oportunidades y cambios del sistema crediticio americano.
          </p>

          <div className="mb-10">
            <p className="text-xs text-gray-500 font-bold mb-1">
              Membresía mensual
            </p>
            <p className="text-5xl font-black text-accent tracking-tighter">
              $XX{" "}
              <span className="text-base font-bold text-gray-500 tracking-normal">
                / mes
              </span>
            </p>
          </div>

          <Link href="/planes">
            <button className="bg-accent text-navy px-12 py-5 rounded-full font-bold text-base flex items-center gap-3 mx-auto hover:bg-accent-hover hover:scale-105 transition-all shadow-xl shadow-accent/20">
              Unirme a la Academia <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </m.div>
    </section>
  );
}
