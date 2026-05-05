"use client";
import { m } from "framer-motion";
import { Globe, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

const STATS = [
  { num: "7+", label: "Años construyendo crédito en USA" },
  { num: "8", label: "Módulos completos" },
  { num: "∞", label: "Actualizaciones incluidas" },
];

const IMPACT = [
  { num: "+500", label: "Alumnos Formados" },
  { num: "7+", label: "Años de Experiencia" },
  { num: "8", label: "Módulos de Formación" },
];

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <Navbar />

      <div className="relative overflow-hidden bg-[#0B1F3A] pt-32 pb-20 px-8 md:px-20 rounded-b-3xl mb-16">
        <div className="absolute inset-0 opacity-[0.025] noise-bg pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[0%] w-[30%] h-[30%] bg-accent/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-6 block">
              Nuestra Historia
            </span>
            <h1 className="font-display text-5xl md:text-8xl font-black text-white tracking-tight mb-8 leading-[0.9]">
              Educación financiera
              <br />
              <span className="text-accent italic">sin fronteras.</span>
            </h1>
            <p className="text-xl text-white/55 leading-relaxed max-w-2xl">
              Academia Credito USA nace con un objetivo claro: que cualquier hispanohablante
              en Estados Unidos pueda entender y dominar el sistema crediticio americano.
            </p>
          </m.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-32">
          <div className="relative h-[500px] w-full rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000"
              alt="Academia Credito USA"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 to-transparent flex items-end p-12">
              <div className="flex flex-wrap gap-12">
                {IMPACT.map((item) => (
                  <div key={item.label} className="text-white">
                    <p className="font-display text-4xl font-black italic text-accent">{item.num}</p>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mb-32">
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
              <p className="text-sm text-muted leading-relaxed mb-6">
                Trabajé como banquero comercial, donde ayudé a decenas de clientes a
                mejorar su perfil crediticio y acceder a financiamiento real. Ese
                tiempo adentro del banco me cambió la perspectiva completamente — vi
                exactamente cómo piensan las instituciones, qué buscan, y qué
                decisiones toman.
              </p>
              <p className="text-sm text-muted leading-relaxed mb-10">
                Hoy comparto todo eso en esta academia. No teoría, no pasos ciegos —
                sino el criterio real que necesitas para tomar decisiones financieras
                inteligentes en este país. Lo que yo ojalá hubiera sabido desde el
                primer día.
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
        </section>

        <section className="bg-card rounded-2xl p-12 md:p-20 border border-card-border flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <Globe size={32} className="text-accent mb-6" />
            <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight mb-4">
              Estamos en toda Latinoamérica.
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-8 max-w-md">
              Nuestra comunidad abarca estudiantes en más de 15 países de habla hispana,
              todos aprendiendo a dominar el sistema crediticio americano.
            </p>
            <Link href="/membresia">
              <button className="bg-foreground text-background px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-all">
                Únete a la comunidad <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
