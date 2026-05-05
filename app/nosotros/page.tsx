"use client";
import { m } from "framer-motion";
import { Globe, ArrowRight, Linkedin, Instagram } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";

const TEAM = [
  {
    name: "Rami Noureddine",
    role: "Fundador & Educador Financiero",
    agency: "Academia Credito USA",
    initials: "RN",
    image: "/rami.jpeg",
  },
  {
    name: "Rodrigo Timaure",
    role: "Director Creativo",
    agency: "Academia Credito USA",
    initials: "RT",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
  },
  {
    name: "Michelle Guerra",
    role: "Co-Fundadora & Productora",
    agency: "Academia Credito USA",
    initials: "MG",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
  },
  {
    name: "Newman Acosta",
    role: "Ingeniero de Sistemas",
    agency: "Academia Credito USA",
    initials: "NA",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400",
  },
];

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        <section className="mb-32">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-6 block">
              Nuestra Historia
            </span>
            <h1 className="font-display text-5xl md:text-8xl font-black text-foreground tracking-tight mb-8 leading-[0.9]">
              Educación financiera
              <br />
              <span className="text-accent italic">sin fronteras.</span>
            </h1>
            <p className="text-xl text-muted leading-relaxed mb-12 max-w-2xl">
              Academia Credito USA nace con un objetivo claro: que cualquier hispanohablante
              en Estados Unidos pueda entender y dominar el sistema crediticio americano.
            </p>
          </m.div>

          <div className="relative h-[500px] w-full rounded-[4rem] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000"
              alt="Academia Credito USA Team"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 to-transparent flex items-end p-12">
              <div className="flex flex-wrap gap-12">
                <div className="text-white">
                  <p className="font-display text-4xl font-black italic text-accent">+500</p>
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                    Alumnos Formados
                  </p>
                </div>
                <div className="text-white">
                  <p className="font-display text-4xl font-black italic text-accent">7+</p>
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                    Años de Experiencia
                  </p>
                </div>
                <div className="text-white">
                  <p className="font-display text-4xl font-black italic text-accent">8</p>
                  <p className="text-xs font-bold text-white/50 uppercase tracking-widest mt-1">
                    Módulos de Formación
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16">
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
              El equipo
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Quiénes están detrás
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member) => (
              <m.div
                key={member.name}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.2 }}
                className="bg-card rounded-[2.5rem] p-6 text-center border border-card-border group overflow-hidden"
              >
                <div className="relative w-full aspect-square rounded-[1.8rem] overflow-hidden mb-6 bg-section-alt">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h4 className="font-display text-lg font-black text-foreground tracking-tight">
                  {member.name}
                </h4>
                <p className="text-xs font-bold text-accent uppercase tracking-widest mt-1 mb-5">
                  {member.role}
                </p>

                <div className="flex justify-center gap-4">
                  <Linkedin
                    size={15}
                    className="text-muted/40 hover:text-accent cursor-pointer transition-colors"
                  />
                  <Instagram
                    size={15}
                    className="text-muted/40 hover:text-accent cursor-pointer transition-colors"
                  />
                </div>
              </m.div>
            ))}
          </div>
        </section>

        <section className="bg-card rounded-[4rem] p-12 md:p-20 border border-card-border flex flex-col md:flex-row items-center gap-12">
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
              <button className="bg-foreground text-background px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:opacity-90 transition-all">
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
