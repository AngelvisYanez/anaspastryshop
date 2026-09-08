"use client";

import { m } from "framer-motion";
import { ArrowRight, Cake } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const TRUST_STATS = [
  { value: "6+", label: "Años Formando" },
  { value: "100%", label: "Práctico Desde Cero" },
  { value: "Calidad", label: "Y Experiencia Garantizada" },
];

export default function Hero({
  isLoggedIn = false,
  userName,
}: {
  isLoggedIn?: boolean;
  userName?: string | null;
}) {
  const ctaUrl = isLoggedIn ? "/dashboard" : "/cursos";
  const ctaText = isLoggedIn ? "Ir a mi panel" : "Ver Workshops & Cursos";

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-b from-[#25072F] via-[#350A43] to-[#1C0425] text-white pt-32 pb-16">
      {/* Background radial effects */}
      <div className="absolute inset-0 opacity-[0.03] noise-bg pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-pink-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-700/25 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <m.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-white">
              ¿Quieres formarte en la{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-pink-300 to-cyan-300">
                pastelería profesional?
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8 max-w-xl font-normal">
              Workshops presenciales y cursos online diseñados desde cero para enseñarte cada técnica, receta y método paso a paso, sin secretos. Para emprender o perfeccionar tu pasión.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link href={ctaUrl}>
                <button className="bg-accent text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2.5 hover:bg-accent-hover hover:scale-[1.03] transition-all shadow-xl shadow-pink-600/30 text-sm md:text-base">
                  {ctaText} <ArrowRight size={18} />
                </button>
              </Link>
              <Link href="/pasteleria">
                <button className="bg-white/10 border border-white/20 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2.5 hover:bg-white/20 hover:scale-[1.03] transition-all backdrop-blur-sm text-sm md:text-base">
                  Tortas y Pastelería <Cake size={18} />
                </button>
              </Link>
            </div>

            <div className="pt-8 border-t border-white/[0.12] flex items-center gap-8 md:gap-12 flex-wrap">
              {TRUST_STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-2xl md:text-3xl font-black text-pink-300 leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-white/50 font-bold uppercase tracking-widest mt-1.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-2 border-pink-500/30 shadow-2xl shadow-purple-950/80 group">
                <Image
                  src="/foto-1.webp"
                  alt="Anais Flores impartiendo workshop de pastelería y decoración"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#25072F]/90 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="font-display text-lg font-bold text-white leading-tight">
                    Clases prácticas 100% desde cero
                  </p>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
