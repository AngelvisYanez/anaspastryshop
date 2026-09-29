"use client";

import { m } from "framer-motion";
import { ArrowRight, Cake } from "lucide-react";
import Link from "next/link";
import { getImageProps } from "next/image";

// Art direction real: la foto cambia por viewport (16:9 escritorio / 9:16 móvil), así que
// usamos <picture> en vez de dos <Image priority>, que precargaban ambas imágenes en cada
// visita (~3.3 MB). El optimizador de Next ahora sirve WebP/AVIF (~150 KB en vez de 2.2 MB).
const HERO_ALT =
  "Ana's Pastry Shop — cursos online globales y workshops en Venezuela con Anais Flores";

const { props: heroMobileProps } = getImageProps({
  alt: HERO_ALT,
  src: "/hero-movil.png",
  width: 1080,
  height: 1920,
  sizes: "100vw",
  quality: 80,
});

const { props: heroDesktopProps } = getImageProps({
  alt: HERO_ALT,
  src: "/hero.png",
  width: 1366,
  height: 768,
  sizes: "100vw",
  quality: 80,
});

const { props: heroDarkDesktopProps } = getImageProps({
  alt: HERO_ALT,
  src: "/hero-dark.png",
  width: 1366,
  height: 768,
  sizes: "100vw",
  quality: 80,
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
      {/* Light: hero.png / hero-movil. Dark desktop: hero-dark.png (gradiente plum ya en la foto). */}
      <picture className="absolute inset-0 dark:hidden">
        <source media="(min-width: 1024px)" srcSet={heroDesktopProps.srcSet} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...heroMobileProps}
          alt={HERO_ALT}
          className="h-full w-full object-cover object-center lg:object-[center_10%]"
          fetchPriority="high"
        />
      </picture>
      <picture className="absolute inset-0 hidden dark:block">
        <source media="(min-width: 1024px)" srcSet={heroDarkDesktopProps.srcSet} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          {...heroMobileProps}
          alt={HERO_ALT}
          // hero-dark: sujeto y tortas a la derecha; ancla el crop ahí.
          className="h-full w-full object-cover object-center lg:object-[88%_55%]"
        />
      </picture>
      {/* Light: velo suave para leer texto. */}
      <div className="absolute inset-0 pointer-events-none dark:hidden bg-gradient-to-t from-background/90 via-background/45 to-background/20 lg:bg-gradient-to-r lg:from-background/85 lg:via-background/50 lg:to-transparent" />
      {/* Dark móvil: degradado intenso. Dark desktop: velo mínimo — hero-dark.png ya oscurece la izquierda. */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block bg-gradient-to-t from-background via-background/85 to-background/60 lg:bg-gradient-to-r lg:from-background/35 lg:via-transparent lg:to-transparent" />

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
