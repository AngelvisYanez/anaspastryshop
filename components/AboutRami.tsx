"use client";
import { m } from "framer-motion";
import Image from "next/image";

const STATS = [
  { num: "7+", label: "Años construyendo crédito en USA" },
  { num: "8", label: "Módulos completos" },
  { num: "∞", label: "Actualizaciones incluidas" },
];

export default function AboutRami() {
  return (
    <section className="w-full bg-section-alt py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-16 block">
            Quién soy
          </span>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-start">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[3/4] bg-card rounded-xl border border-card-border overflow-hidden relative">
              <Image
                src="/rami.jpeg"
                alt="Rami Noureddine"
                fill
                className="object-cover object-top"
              />
              <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-card to-transparent" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-4 bg-card rounded-xl border border-card-border"
                >
                  <span className="font-display block text-2xl font-black text-accent tracking-tight mb-1">
                    {stat.num}
                  </span>
                  <span className="text-[10px] font-bold text-muted leading-tight block">
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
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight mb-2">
              Rami Noureddine
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-10">
              Fundador · Academia Crédito USA
            </p>

            <p className="text-sm text-muted leading-relaxed mb-6">
              Soy venezolano, residente en Estados Unidos. Mi primer contacto con
              el crédito americano fue a los 18 años — sin número de seguro
              social, sin historial, y con una tarjeta de $5,000 que terminó
              financiando mis estudios en el Líbano durante una crisis bancaria.
              Desde ese momento me obsesioné con entender cómo funciona este
              sistema desde adentro.
            </p>
            <p className="text-sm text-muted leading-relaxed mb-10">
              Trabajé como banquero comercial, donde ayudé a decenas de clientes a
              mejorar su perfil crediticio y acceder a financiamiento real. Ese
              tiempo adentro del banco me cambió la perspectiva completamente — vi
              exactamente cómo piensan las instituciones, qué buscan, y qué
              decisiones toman. Hoy comparto todo eso en esta academia. Lo que yo
              ojalá hubiera sabido desde el primer día.
            </p>

            <div className="relative bg-card rounded-xl px-8 py-7 border border-card-border overflow-hidden">
              <span className="font-display absolute top-2 left-5 text-[7rem] leading-none text-accent/10 font-black select-none pointer-events-none">
                &ldquo;
              </span>
              <p className="relative z-10 text-base text-foreground leading-relaxed font-medium">
                El objetivo no es darte una lista de pasos a seguir ciegamente.
                Es que desarrolles tu propio sentido lógico para tomar decisiones
                financieras.
              </p>
              <div className="mt-5 pt-5 border-t border-card-border flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <span className="text-accent text-xs font-bold">RN</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Rami Noureddine</p>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Fundador</p>
                </div>
              </div>
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
