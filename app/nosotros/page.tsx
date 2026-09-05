"use client";
import { m } from "framer-motion";
import { ArrowRight, BookOpen, Users, Zap, Shield, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

const BENEFITS = [
  {
    icon: BookOpen,
    title: "Cursos en tu idioma",
    desc: "Todo el contenido en español, diseñado para que aprendas sin barreras y a tu propio ritmo.",
  },
  {
    icon: TrendingUp,
    title: "Método práctico",
    desc: "No teoría vacía. Aprende con proyectos reales y ejercicios que puedes aplicar desde el primer día.",
  },
  {
    icon: Users,
    title: "Comunidad activa",
    desc: "Rodéate de cientos de alumnos que comparten tu misma meta y aprenden juntos a crecer.",
  },
  {
    icon: Zap,
    title: "Lives y webinars",
    desc: "Sesiones en vivo donde puedes traer tus dudas y recibir orientación directa para tu caso específico.",
  },
  {
    icon: Shield,
    title: "Contenido siempre actualizado",
    desc: "El mundo digital cambia. Tu acceso incluye todas las actualizaciones para que siempre estés un paso adelante.",
  },
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
              Educación digital
              <br />
              <span className="text-accent italic">sin fronteras.</span>
            </h1>
            <p className="text-xl text-white/55 leading-relaxed max-w-2xl">
              Academia Omnia nace con un objetivo claro: que cualquier persona
              pueda dominar las herramientas digitales y crecer profesionalmente,
              sin importar de dónde venga.
            </p>
          </m.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <section className="mb-24">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
              Por qué elegirnos
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight">
              Todo lo que necesitas para
              <br />
              <span className="text-accent italic">dominar tus habilidades.</span>
            </h2>
          </m.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <m.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card border border-card-border rounded-2xl p-8 hover:border-accent/30 transition-colors"
              >
                <div className="w-11 h-11 bg-accent/10 rounded-xl flex items-center justify-center mb-5">
                  <b.icon size={20} className="text-accent" />
                </div>
                <h3 className="font-bold text-foreground text-base mb-2">{b.title}</h3>
                <p className="text-muted text-sm leading-relaxed">{b.desc}</p>
              </m.div>
            ))}
          </div>
        </section>

        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <m.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-[420px] rounded-2xl overflow-hidden"
            >
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2000"
                alt="Aprendizaje en línea"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0B1F3A]/60 to-transparent" />
            </m.div>
            <m.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col justify-center"
            >
              <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
                Nuestro método
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-5">
                Aprende con una visión
                <br />
                <span className="text-accent italic">integral y 360°.</span>
              </h2>
              <p className="text-muted text-sm leading-relaxed mb-4">
                En el mundo actual, dominar una sola herramienta ya no es
                suficiente. Nuestro enfoque conecta la técnica con la práctica
                para que entiendas el porqué detrás de cada decisión.
              </p>
              <p className="text-muted text-sm leading-relaxed">
                Te guiamos paso a paso con contenido claro, proyectos reales y
                acompañamiento cercano — en tu idioma y a tu ritmo.
              </p>
            </m.div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#0B1F3A] rounded-2xl p-12 md:p-20 border border-white/5">
          <div className="absolute top-[-10%] right-[-5%] w-[35%] h-[35%] bg-accent/15 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
                Empieza hoy
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
                Tu crecimiento profesional
                <br />
                <span className="text-accent italic">empieza con una decisión.</span>
              </h2>
              <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-lg">
                Accede a cursos, sesiones en vivo, webinars y una comunidad activa
                que aprende junta a dominar las herramientas del mundo digital.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/membresia">
                  <button className="bg-accent text-[#0B1F3A] px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-accent-hover transition-all shadow-xl shadow-accent/20 text-sm uppercase tracking-wider">
                    Ver membresía <ArrowRight size={18} />
                  </button>
                </Link>
                <Link href="/cursos">
                  <button className="bg-white/[0.06] border border-white/[0.12] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-white/[0.1] transition-all text-sm uppercase tracking-wider">
                    Explorar cursos
                  </button>
                </Link>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 shrink-0">
              {[
                { num: "$97", label: "al mes" },
                { num: "100%", label: "online" },
                { num: "+500", label: "alumnos" },
                { num: "∞", label: "actualizaciones" },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.05] border border-white/[0.08] rounded-xl p-5 text-center">
                  <p className="font-display text-3xl font-black text-accent italic mb-1">{s.num}</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
