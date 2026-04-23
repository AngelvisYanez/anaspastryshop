"use client";
import { m } from "framer-motion";
import { User } from "lucide-react";

const STATS = [
  { num: "7+", label: "Años construyendo crédito en USA" },
  { num: "8", label: "Módulos completos" },
  { num: "∞", label: "Actualizaciones incluidas" },
];

export default function AboutRami() {
  return (
    <section className="py-24 px-4 md:px-10 max-w-7xl mx-auto">
      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-accent font-black uppercase tracking-[0.3em] text-xs mb-16 block">
          Quién soy
        </span>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-20 items-center">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="aspect-[3/4] bg-card rounded-[2.5rem] border border-card-border shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-center overflow-hidden relative"
        >
          <User size={80} className="text-muted opacity-30" />
          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-card to-transparent" />
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-2">
            Rami Noureddine
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-8">
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

          <div className="grid grid-cols-3 gap-4 mb-10">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="text-center p-5 bg-card rounded-2xl border border-card-border shadow-sm"
              >
                <span className="block text-2xl font-black text-accent tracking-tighter mb-1">
                  {stat.num}
                </span>
                <span className="text-[10px] font-bold text-muted leading-tight block">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-accent-subtle rounded-2xl px-7 py-5">
            <p className="text-sm text-muted italic leading-relaxed font-medium">
              &ldquo;El objetivo no es darte una lista de pasos a seguir
              ciegamente. Es que desarrolles tu propio sentido lógico para tomar
              decisiones financieras.&rdquo;
            </p>
          </div>
        </m.div>
      </div>
    </section>
  );
}
