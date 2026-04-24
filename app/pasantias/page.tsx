"use client";
import { m } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Zap,
  Star,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const STEPS = [
  {
    title: "Formación Élite",
    desc: "Completa cualquiera de nuestros cursos certificados con un promedio sobresaliente.",
    icon: <Star className="text-yellow-500" />,
  },
  {
    title: "Proyecto Final",
    desc: "Presenta un proyecto real que resuelva un problema técnico o creativo de la agencia.",
    icon: <Zap className="text-purple-500" />,
  },
  {
    title: "Entrevista Técnica",
    desc: "Reunión directa con Rodrigo, Michelle o el equipo senior de Academia Credito USA.",
    icon: <Briefcase className="text-blue-500" />,
  },
  {
    title: "Onboarding",
    desc: "¡Bienvenido al equipo! Empieza a trabajar en proyectos de Latinoamérica y EEUU.",
    icon: <CheckCircle2 className="text-green-500" />,
  },
];

export default function PasantiasPage() {
  return (
    <main className="min-h-screen bg-[#F8F4EE] pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        {/* --- HEADER --- */}
        <section className="text-center mb-24">
          <m.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#C9A84C] font-black uppercase tracking-[0.3em] text-xs mb-4 block"
          >
            Career Path
          </m.span>
          <h1 className="text-5xl md:text-8xl font-black text-[#0B1F3A] tracking-tighter mb-8 leading-none">
            De Alumno a <br />{" "}
            <span className="text-gray-300 italic">Professional.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Nuestro programa de pasantías no es para "sacar copias". Es para
            construir el futuro de **Academia Credito USA** y **Academia Credito USA** junto a
            nosotros.
          </p>
        </section>

        {/* --- ROADMAP STEPS --- */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-32 relative">
          {/* Línea decorativa de fondo en Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10" />

          {STEPS.map((step, index) => (
            <m.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl transition-all"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-[#0B1F3A] mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {step.desc}
              </p>
              <div className="mt-6 text-[10px] font-black text-gray-200">
                STEP 0{index + 1}
              </div>
            </m.div>
          ))}
        </section>

        {/* --- SECCIÓN DE BENEFICIOS (Bento Style) --- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <div className="bg-[#0B1F3A] text-white rounded-[3rem] p-12 md:p-16 flex flex-col justify-between overflow-hidden relative">
            <div className="z-10">
              <ShieldCheck className="text-[#C9A84C] mb-6" size={40} />
              <h2 className="text-4xl font-bold mb-6">
                Certificación con <br /> Respaldo Internacional
              </h2>
              <p className="text-gray-400 text-lg max-w-sm">
                Al terminar tu pasantía, recibes una certificación avalada por
                Academia Credito USAdemy — avalada por Academia Credito USA (Miami) — que valida tu experiencia en el mercado
                global.
              </p>
            </div>
            <div className="absolute right-[-10%] bottom-[-10%] opacity-10 rotate-12">
              <Briefcase size={300} />
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-12 md:p-16 border border-gray-100 flex flex-col justify-center">
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="p-4 bg-amber-50 rounded-2xl text-[#C9A84C] font-bold">
                  01
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Mentoria 1-on-1</h4>
                  <p className="text-gray-500">
                    Sesiones semanales de revisión de código o diseño con los
                    fundadores.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="p-4 bg-amber-50 rounded-2xl text-[#C9A84C] font-bold">
                  02
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">Proyectos Reales</h4>
                  <p className="text-gray-500">
                    Nada de ejercicios ficticios. Trabajarás en marcas que están
                    operando ahora mismo.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="p-4 bg-green-50 rounded-2xl text-[#C9A84C] font-bold">
                  03
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-1">
                    Posibilidad de Contratación
                  </h4>
                  <p className="text-gray-500">
                    El 70% de nuestros pasantes destacados terminan con una
                    oferta laboral fija.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- CTA FINAL --- */}
        <section className="bg-gradient-to-br from-[#C9A84C] to-[#0B1F3A] rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="z-10 relative">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
              ¿Listo para el desafío?
            </h2>
            <p className="text-indigo-100 text-xl mb-12 max-w-xl mx-auto">
              Solo abrimos 5 cupos de pasantía por trimestre para garantizar la
              calidad del aprendizaje.
            </p>
            <button className="bg-white text-[#0B1F3A] px-12 py-6 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-2xl">
              Postularme ahora <ArrowRight size={20} />
            </button>
          </div>
          {/* Decoración */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </section>
      </div>

      <Footer />
    </main>
  );
}
