"use client";
import { m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  price: number | null;
  planName: string | null;
}

export default function CtaBanner({ price, planName }: Props) {
  return (
    <section className="py-24 px-4 md:px-10 max-w-5xl mx-auto">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-[#0B1F3A] dark:bg-card rounded-2xl p-12 md:p-20 text-center"
      >
        <div className="absolute inset-0 rounded-2xl opacity-[0.03] noise-bg pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-accent/15 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-5%] w-64 h-64 bg-accent/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-accent/70 mb-6">
            {planName ?? "Membresía mensual"}
          </p>

          <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight mb-5 leading-[0.95]">
            El conocimiento sin acción{" "}
            <span className="text-accent">no cambia nada.</span>
          </h2>

          <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Empieza hoy. Aprende a tu ritmo. Accede a sesiones en vivo, módulos
            completos, y una comunidad que se actualiza constantemente con las
            últimas oportunidades y cambios del sistema crediticio americano.
          </p>

          {price !== null ? (
            <p className="font-display text-6xl font-black text-accent tracking-tight mb-10">
              ${price}
              <span className="text-xl font-bold text-white/30 tracking-normal"> / mes</span>
            </p>
          ) : (
            <p className="font-display text-3xl font-black text-accent tracking-tight mb-10">
              Próximamente
            </p>
          )}

          <Link href="/membresia">
            <button className="bg-accent text-[#0B1F3A] px-12 py-5 rounded-xl font-bold text-base flex items-center gap-3 mx-auto hover:bg-accent-hover hover:scale-[1.03] transition-all shadow-xl shadow-accent/20">
              Unirme a la Academia <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </m.div>
    </section>
  );
}
