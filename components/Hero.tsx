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
      <div className="relative overflow-hidden bg-card rounded-[3.5rem] min-h-[85vh] flex items-center p-8 md:p-16 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-card-border">
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-glow-a blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-glow-b blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-accent-subtle border border-card-border px-4 py-2 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                La academia de crédito para hispanohablantes
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground mb-6 leading-[0.9]">
              Domina el sistema de crédito en{" "}
              <span className="text-accent italic">Estados Unidos</span>
            </h1>

            <p className="text-lg text-muted max-w-xl mb-10 leading-relaxed font-medium">
              Lo que los bancos no te explican. Aprende a dominar el crédito en
              Estados Unidos para mejorar tu vida financiera, calificar para las
              mejores condiciones del mercado, y emprender negocios con capital
              del banco.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href={ctaUrl}>
                <button className="bg-navy dark:bg-accent text-white dark:text-navy px-10 py-5 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-2xl shadow-accent/20">
                  {ctaText} <ArrowRight size={20} />
                </button>
              </Link>
              <a href="#para-ti">
                <button className="bg-card text-foreground px-10 py-5 rounded-full font-bold border border-card-border hover:bg-card-hover transition-all flex items-center gap-2">
                  <ChevronDown size={18} /> ¿Es para mí?
                </button>
              </a>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="bg-section-alt rounded-[2.5rem] p-8 md:p-10 border border-card-border"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-6">
              Acceso instantáneo a todo lo que necesitas
            </p>

            <ul className="space-y-0">
              {FEATURES.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-3 py-3.5 border-b border-card-border last:border-b-0 text-sm text-muted font-medium leading-snug"
                >
                  <span className="text-accent mt-0.5 shrink-0">→</span>
                  {feat}
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-card-border">
              <p className="text-xs text-muted font-bold mb-1">
                Precio de membresía mensual
              </p>
              <p className="text-4xl font-black text-accent tracking-tighter">
                {price !== null ? (
                  <>
                    ${price}
                    <span className="text-base font-bold text-muted tracking-normal"> / mes</span>
                  </>
                ) : (
                  <span className="text-2xl text-muted font-bold">Cargando...</span>
                )}
              </p>
              <Link href="/membresia">
                <button className="mt-4 w-full bg-accent text-white py-4 rounded-2xl font-bold hover:bg-accent-hover transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20">
                  Ver membresía <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
