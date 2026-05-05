"use client";
import { m } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const FEATURES = [
  "Módulos de crédito personal y empresarial",
  "Sesiones en vivo con Rami Noureddine",
  "Comunidad activa y actualizaciones en tiempo real",
  "Acceso a grabaciones y material exclusivo",
];

const TRUST_STATS = [
  { value: "7+", label: "Años de experiencia" },
  { value: "8", label: "Módulos completos" },
  { value: "∞", label: "Actualizaciones" },
];

export default function Hero() {
  const [price, setPrice] = useState<number | null>(null);
  const [ctaText, setCtaText] = useState("Quiero unirme ahora");
  const [ctaUrl, setCtaUrl] = useState("/membresia");

  useEffect(() => {
    fetch("/api/settings/site-config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.subscriptionPrice) setPrice(cfg.subscriptionPrice);
        if (cfg.ctaText) setCtaText(cfg.ctaText);
        if (cfg.ctaUrl) setCtaUrl(cfg.ctaUrl);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative">
      <div className="relative overflow-hidden bg-[#0B1F3A] dark:bg-card min-h-screen flex items-center px-8 md:px-20 pt-32 pb-24 rounded-b-3xl">
        <div className="absolute inset-0 opacity-[0.025] noise-bg pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[0%] w-[30%] h-[30%] bg-accent/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-12 lg:gap-20 items-center">
          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.1] px-4 py-2 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                La academia de crédito para hispanohablantes
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight mb-6">
              Domina el sistema
              <br />
              de crédito en{" "}
              <span className="text-accent">Estados Unidos</span>
            </h1>

            <p className="text-white/55 text-lg max-w-lg mb-10 leading-relaxed">
              Lo que los bancos no te explican. Aprende a dominar el crédito,
              calificar para las mejores condiciones y emprender con capital del banco.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link href={ctaUrl}>
                <button className="bg-accent text-[#0B1F3A] px-9 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-hover hover:scale-[1.03] transition-all shadow-xl shadow-accent/25">
                  {ctaText} <ArrowRight size={18} />
                </button>
              </Link>
              <a href="#para-ti">
                <button className="bg-white/[0.08] border border-white/[0.15] text-white px-9 py-4 rounded-xl font-bold hover:bg-white/[0.13] transition-all flex items-center gap-2">
                  <ChevronDown size={16} /> ¿Es para mí?
                </button>
              </a>
            </div>

            <div className="pt-8 border-t border-white/[0.1] flex items-center gap-8 flex-wrap">
              {TRUST_STATS.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-8">
                  <div>
                    <p className="font-display text-3xl font-black text-accent leading-none">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mt-1">
                      {stat.label}
                    </p>
                  </div>
                  {i < TRUST_STATS.length - 1 && (
                    <div className="h-9 w-px bg-white/[0.1]" />
                  )}
                </div>
              ))}
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative bg-white/[0.06] backdrop-blur border border-white/[0.12] rounded-2xl overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-accent/60 via-accent to-accent/60" />
              <div className="p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent/80 mb-2">
                  Membresía mensual
                </p>
                {price !== null ? (
                  <p className="font-display text-5xl font-black text-accent tracking-tight leading-none mb-1">
                    ${price}
                    <span className="text-lg font-bold text-white/30 tracking-normal"> /mes</span>
                  </p>
                ) : (
                  <div className="h-12 mb-1" />
                )}

                <p className="text-[11px] text-white/30 mb-7">Cancela cuando quieras</p>

                <ul className="space-y-3.5 mb-8">
                  {FEATURES.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm text-white/60 leading-snug">
                      <span className="text-accent shrink-0 text-xs mt-0.5">✦</span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link href="/membresia">
                  <button className="w-full bg-accent text-[#0B1F3A] py-4 rounded-xl font-bold hover:bg-accent-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 text-sm">
                    Ver membresía <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
