"use client";
import { m } from "framer-motion";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

const STATS = [
  { num: "6+", label: "Años formando alumnos" },
  { num: "100%", label: "Práctico desde cero" },
  { num: "8 Horas", label: "Jornada intensiva guiada" },
];

export default function About() {
  return (
    <section id="sobre-anais" className="w-full bg-section-alt py-24 scroll-mt-20">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-accent font-bold uppercase tracking-[0.25em] text-xs mb-12 block">
            Sobre Anais Flores · Ana&apos;s Pastry Shop
          </span>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.35fr] gap-12 lg:gap-20 items-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[3/4] bg-card rounded-3xl border border-card-border overflow-hidden shadow-xl group">
              <Image
                src="/foto-2.webp"
                alt="Anais Flores impartiendo workshop"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#2B0938]/90 via-[#2B0938]/40 to-transparent p-6 flex flex-col justify-end">
                <p className="text-white font-black text-xl">Anais Flores</p>
                <p className="text-pink-300 text-xs font-medium">Ingeniero Químico · Panadera y Pastelera Profesional</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 bg-card rounded-2xl border border-card-border shadow-sm"
                >
                  <span className="font-display block text-xl md:text-2xl font-black text-accent tracking-tight mb-1">
                    {stat.num}
                  </span>
                  <span className="text-[11px] font-bold text-muted leading-tight block">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6">
              ¡Hola! Soy Anais Flores
            </h2>

            <p className="text-base text-foreground/85 leading-relaxed mb-5 font-medium max-w-prose">
              Cuento con más de 6 años en el mundo de la pastelería y con una amplia experiencia dictando talleres a lo largo de este tiempo.
            </p>

            <p className="text-sm text-muted leading-relaxed mb-8 max-w-prose">
              Hemos adaptado nuestros talleres para que te sientas plenamente cómodo a la hora de realizarlos. Están desarrollados <strong>desde cero</strong>, es decir, no es necesario tener ningún conocimiento previo ya que en ellos nos encargamos de enseñarte todas las técnicas, recetas y métodos necesarios para que te desenvuelvas de la mejor manera posible.
            </p>

            <div className="relative bg-card rounded-2xl p-7 border border-card-border overflow-hidden mb-8 shadow-sm">
              <p className="relative z-10 text-base md:text-lg text-foreground leading-relaxed font-bold italic mb-3">
                &ldquo;El conocimiento nos hace responsables. Invertir en conocimientos produce siempre los mejores beneficios.&rdquo;
              </p>
              <p className="relative z-10 text-xs text-muted leading-relaxed mb-5">
                Por favor, lee detalladamente toda la información que te presento para que resolvamos todas tus dudas, y si decides capacitarte... ¡escríbeme!
              </p>

              <a
                href="https://wa.me/?text=Hola%20Anais!%20He%20le%C3%ADdo%20sobre%20tus%20workshops%20y%20quiero%20capacitarme"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-600/20"
              >
                <MessageCircle size={14} /> ¡Escríbeme para capacitarte!
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/cursos">
                <button className="w-full sm:w-auto bg-accent text-white px-8 py-3.5 rounded-xl font-bold hover:bg-accent-hover transition-all text-sm shadow-md shadow-pink-600/20">
                  Ver Próximos Workshops
                </button>
              </Link>
              <Link href="/nosotros">
                <button className="w-full sm:w-auto bg-card border border-card-border hover:bg-card-hover text-foreground px-6 py-3.5 rounded-xl font-bold transition-all text-sm">
                  Conocer Historia Completa
                </button>
              </Link>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
