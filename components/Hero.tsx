"use client";

import { m } from "framer-motion";
import { ArrowRight, Cake } from "lucide-react";
import Link from "next/link";
import Image, { getImageProps } from "next/image";

const HERO_ALT =
  "Anais Flores en su cocina de pastelería, junto a tres batidoras";

const { props: { srcSet: desktopHeroSrcSet } } = getImageProps({
  src: "/hero-escritorio.jpg",
  alt: HERO_ALT,
  fill: true,
  sizes: "100vw",
  quality: 85,
});

export default function Hero({
  isLoggedIn = false,
}: {
  isLoggedIn?: boolean;
  userName?: string | null;
}) {
  const ctaUrl = isLoggedIn ? "/dashboard" : "/cursos";
  const ctaText = isLoggedIn ? "Ir a mi panel" : "Ver Workshops & Cursos";

  return (
    <section className="relative min-h-svh flex items-end lg:items-center overflow-hidden bg-section-alt text-foreground pb-10 lg:pt-32 lg:pb-16">
      <picture className="absolute inset-0">
        <source media="(min-width: 1024px)" srcSet={desktopHeroSrcSet} />
        <Image
          src="/hero-1 (1).jpeg"
          alt={HERO_ALT}
          fill
          fetchPriority="high"
          sizes="100vw"
          quality={85}
          className="object-cover object-[center_28%] lg:object-center"
        />
      </picture>
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,var(--background)_0%,var(--background)_45%,transparent_75%)] lg:hidden dark:lg:block dark:lg:bg-gradient-to-r dark:lg:from-background dark:lg:via-background/25 dark:lg:to-transparent" />

      <div className="page-container w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <m.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col justify-center items-center text-center lg:items-start lg:text-left pt-24 pb-6 lg:py-0"
          >
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-3 lg:mb-4 text-foreground">
              ¿Quieres formarte en{" "}
              <span className="text-accent">la pastelería profesional?</span>
            </h1>
            <p className="text-sm sm:text-base text-muted leading-relaxed mb-6 lg:mb-8 max-w-xl">
              Workshops en Coro, Falcón, y cursos online para todo el mundo: cada técnica, receta y método paso a paso, sin secretos.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start lg:gap-4">
              <Link
                href={ctaUrl}
                className="bg-accent-solid text-white px-5 py-3 lg:px-8 lg:py-4 rounded-xl font-bold inline-flex items-center gap-2.5 hover:bg-accent-solid-hover transition-colors shadow-lg shadow-accent-solid/25 text-sm md:text-base"
              >
                {ctaText} <ArrowRight size={18} />
              </Link>
              <Link
                href="/pasteleria"
                className="bg-white/80 dark:bg-white/10 border border-card-border text-foreground px-5 py-3 lg:px-8 lg:py-4 rounded-xl font-bold inline-flex items-center gap-2.5 hover:bg-white dark:hover:bg-white/15 transition-colors text-sm md:text-base"
              >
                Tortas y Pastelería <Cake size={18} />
              </Link>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
