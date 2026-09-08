"use client";

import { m } from "framer-motion";
import { ArrowRight, Award, CheckCircle2, Clock, Heart, MessageCircle, Sparkles, UtensilsCrossed } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

const PILLARS = [
  {
    icon: Sparkles,
    title: "Técnica y Precisión Profesional",
    desc: "Comprender el funcionamiento de cada ingrediente, punto de batido y temperatura de horneado permite obtener recetas estables y resultados impecables siempre.",
  },
  {
    icon: Award,
    title: "Más de 6 Años de Experiencia",
    desc: "Una trayectoria consolidada en la pastelería profesional y en la formación de cientos de apasionados y emprendedores a lo largo de este tiempo.",
  },
  {
    icon: UtensilsCrossed,
    title: "Desarrollados Desde Cero",
    desc: "No necesitas experiencia previa. Cada taller está concebido pedagógicamente para guiarte paso a paso con comodidad, soltura y total seguridad.",
  },
  {
    icon: Heart,
    title: "El Conocimiento Nos Hace Responsables",
    desc: "Formamos con honestidad, enseñando el porqué detrás de cada proceso para que adquieras criterio propio y seguridad en cada preparación.",
  },
];

const GALLERY = [
  { src: "/foto-1.webp", alt: "Taller presencial de alisado y decoración de pasteles" },
  { src: "/foto-2.webp", alt: "Anais Flores explicando técnicas de pastelería" },
  { src: "/foto-3.webp", alt: "Alumnas trabajando en clase práctica" },
  { src: "/foto-4.webp", alt: "Preparación de rellenos y cremas" },
  { src: "/foto-5.webp", alt: "Detalle de decoración y acabados" },
  { src: "/foto-6.webp", alt: "Panadería artesanal y masas fermentadas" },
];

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Nosotros */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#280732] via-[#350A43] to-[#1C0425] pt-36 pb-24 px-6 md:px-20 text-white rounded-b-3xl">
        <div className="absolute inset-0 opacity-[0.03] noise-bg pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 relative z-10 text-center">
          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6"
          >
            El arte de la técnica, la{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-pink-300 to-cyan-300 italic">
              pasión de la pastelería.
            </span>
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed"
          >
            Conoce la historia, filosofía y método formativo liderado por Anais Flores, diseñado para enseñarte pastelería profesional desde cero.
          </m.p>
        </div>
      </section>

      {/* Main Bio Section */}
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 py-20">
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] gap-12 lg:gap-16 items-center mb-24">
          <m.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-2 border-pink-500/20 shadow-2xl">
              <Image
                src="/foto-2.webp"
                alt="Anais Flores impartiendo workshop"
                fill
                priority
                className="object-cover"
              />
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              ¡Hola! Soy Anais Flores
            </h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider flex-wrap">
              <span>Ingeniero Químico</span>
              <span>•</span>
              <span className="normal-case tracking-normal">Panadero y Pastelera Profesional</span>
              <span>•</span>
              <span>6+ Años de Trayectoria</span>
            </div>

            <p className="text-base text-foreground/85 leading-relaxed max-w-prose">
              ¡Hola! Soy <strong>Anais Flores</strong>, ingeniero químico, panadero y pastelera profesional. Cuento con más de 6 años en el mundo de la pastelería y con una amplia experiencia dictando talleres a lo largo de este tiempo.
            </p>

            <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
              <p className="text-base md:text-lg font-display font-black text-accent mb-2 italic">
                &ldquo;El conocimiento nos hace responsables. Invertir en conocimientos produce siempre los mejores beneficios.&rdquo;
              </p>
              <p className="text-sm text-muted leading-relaxed">
                Hemos adaptado nuestros talleres para que te sientas plenamente cómodo a la hora de realizarlos. Están desarrollados <strong>desde cero</strong>, es decir, no es necesario tener ningún conocimiento previo ya que en ellos nos encargamos de enseñarte todas las técnicas, recetas y métodos necesarios para que te desenvuelvas de la mejor manera posible.
              </p>
            </div>

            <p className="text-sm text-muted leading-relaxed">
              Por favor, lee detalladamente toda la información que te presento en cada workshop para que resolvamos todas tus dudas, y si decides capacitarte... ¡escríbeme!
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/?text=Hola%20Anais!%20He%20le%C3%ADdo%20sobre%20tus%20talleres%20y%20quiero%20m%C3%A1s%20informaci%C3%B3n"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent text-white px-7 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-accent-hover transition-all shadow-md shadow-pink-600/20"
              >
                <MessageCircle size={16} /> ¡Escríbeme para Capacitarte!
              </a>
              <Link href="/cursos">
                <button className="w-full sm:w-auto bg-card border border-card-border hover:bg-card-hover text-foreground px-6 py-3.5 rounded-xl font-bold text-sm transition-all">
                  Ver Catálogo de Workshops
                </button>
              </Link>
            </div>
          </m.div>
        </section>

        {/* 4 Pillars Section */}
        <section className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Los 4 Pilares de Nuestra Enseñanza
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <m.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card border border-card-border rounded-2xl p-6 shadow-sm hover:border-accent/30 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0 border border-accent/20">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground leading-snug pt-1">
                      {p.title}
                    </h3>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                      {p.desc}
                    </p>
                </m.div>
              );
            })}
          </div>
        </section>

        {/* Workshop Moments Gallery */}
        <section className="mb-20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-foreground tracking-tight">
                Momentos en Nuestros Workshops
              </h2>
            </div>
            <Link
              href="/cursos"
              className="text-accent text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
            >
              Ver próximas fechas <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {GALLERY.map((photo, i) => (
              <m.div
                key={photo.src}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative aspect-square rounded-2xl overflow-hidden border border-card-border shadow-sm group"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </m.div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
