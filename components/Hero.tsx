"use client";
import { m } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const FEATURES = [
  "Módulos completos de crédito personal y empresarial",
  "Sesiones en vivo con Rami Noureddine, mes a mes",
  "Comunidad activa con actualizaciones en tiempo real",
  "Estrategias probadas para construir y reparar crédito",
  "Acceso a grabaciones y material exclusivo",
  "Orientación directa para tu situación específica",
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
    <section className="px-4 md:px-10 pt-24">
      <div className="relative overflow-hidden bg-[#0B1F3A] dark:bg-card rounded-[3.5rem] min-h-[88vh] flex items-center p-8 md:p-16">
        <div className="absolute inset-0 rounded-[3.5rem] opacity-[0.025] noise-bg pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[0%] w-[30%] h-[30%] bg-accent/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-20 items-center">
          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.1] px-4 py-2 rounded-full mb-10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                La academia de crédito para hispanohablantes
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[0.88] tracking-tight mb-8">
              Domina el sistema
              <br />
              de crédito en{" "}
              <span className="text-accent italic">
                Estados Unidos
              </span>
            </h1>

            <p className="text-white/55 text-lg max-w-xl mb-10 leading-relaxed">
              Lo que los bancos no te explican. Aprende a dominar el crédito en
              Estados Unidos para mejorar tu vida financiera, calificar para las
              mejores condiciones del mercado, y emprender negocios con capital
              del banco.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href={ctaUrl}>
                <button className="bg-accent text-[#0B1F3A] px-10 py-5 rounded-full font-bold flex items-center gap-2 hover:bg-accent-hover hover:scale-[1.03] transition-all shadow-xl shadow-accent/25">
                  {ctaText} <ArrowRight size={20} />
                </button>
              </Link>
              <a href="#para-ti">
                <button className="bg-white/[0.08] border border-white/[0.15] text-white px-10 py-5 rounded-full font-bold hover:bg-white/[0.13] transition-all flex items-center gap-2">
                  <ChevronDown size={18} /> ¿Es para mí?
                </button>
              </a>
            </div>

            <div className="mt-12 pt-8 border-t border-white/[0.1] flex items-center gap-8 flex-wrap">
              {TRUST_STATS.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-8">
                  <div>
                    <p className="font-display text-3xl font-black text-accent italic leading-none">
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
            className="flex flex-col gap-4"
          >
            <div className="bg-white/[0.06] backdrop-blur border border-white/[0.1] rounded-[2.5rem] p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent/80 mb-4">
                Precio de membresía mensual
              </p>
              {price !== null ? (
                <p className="font-display text-6xl font-black text-accent italic tracking-tight leading-none">
                  ${price}
                  <span className="text-xl font-bold text-white/30 not-italic tracking-normal"> /mes</span>
                </p>
              ) : (
                <p className="font-display text-3xl font-black text-white/25 italic">
                  Cargando...
                </p>
              )}
              <Link href="/membresia">
                <button className="mt-6 w-full bg-accent text-[#0B1F3A] py-4 rounded-2xl font-bold hover:bg-accent-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 text-sm">
                  Ver membresía <ArrowRight size={16} />
                </button>
              </Link>
            </div>

            <div className="bg-white/[0.05] border border-white/[0.1] rounded-[2.5rem] px-8 py-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent/80 mb-4">
                Acceso instantáneo a
              </p>
              <ul className="space-y-0">
                {FEATURES.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-3 py-3 border-b border-white/[0.07] last:border-b-0 text-sm text-white/50 leading-snug"
                  >
                    <span className="text-accent mt-0.5 shrink-0 text-xs">→</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
