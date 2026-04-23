"use client";
import { m } from "framer-motion";
// Corregido: Agregamos ArrowRight y eliminamos Users que no se usaba
import {
  Target,
  Rocket,
  Globe,
  MapPin,
  Linkedin,
  Instagram,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

const TEAM = [
  {
    name: "Rodrigo Timaure",
    role: "Founder & Creative Director",
    agency: "Artica Group",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400",
  },
  {
    name: "Michelle Guerra",
    role: "Co-Founder & Producer",
    agency: "4101 Media",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400",
  },
  {
    name: "Newman Acosta",
    role: "Systems Engineer & Full Stack Dev",
    agency: "Articademy",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400",
  },
  {
    name: "Cesar Arteaga",
    role: "Lead Developer",
    agency: "Artica Group",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400",
  },
];

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-[#F8F4EE] pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        <section className="mb-32">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="text-[#C9A84C] font-black uppercase tracking-[0.3em] text-xs mb-6 block">
              Nuestra Historia
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-[#0B1F3A] tracking-tighter mb-8 leading-[0.9]">
              Formando la élite <br />
              <span className="text-gray-300 italic">digital de Falcón.</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-12">
              Articademy nace de la unión estratégica entre **Artica
              Group (Miami)** y **4101 Media (Latinoamérica)**.
            </p>
          </m.div>

          {/* Sugerencia Tailwind: h-[500px] -> h-125 */}
          <div className="relative h-125 w-full rounded-[4rem] overflow-hidden shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000"
              alt="Artica Team"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Sugerencia Tailwind: bg-gradient-to-t -> bg-linear-to-t */}
            <div className="absolute inset-0 bg-linear-to-t from-[#0B1F3A]/80 to-transparent flex items-end p-12">
              <div className="flex flex-wrap gap-10">
                <div className="text-white">
                  <p className="text-4xl font-black italic">+500</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Alumnos Formados
                  </p>
                </div>
                <div className="text-white">
                  <p className="text-4xl font-black italic">2</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Agencias Aliadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- TEAM SECTION --- */}
        <section className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-[#0B1F3A] mb-4">
              Los Mentores
            </h2>
            <p className="text-gray-500">
              Expertos activos en la industria digital.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {TEAM.map((member) => (
              <m.div
                key={member.name}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[2.5rem] p-6 text-center border border-gray-100 group"
              >
                {/* Sugerencia Tailwind: rounded-[2rem] -> rounded-4xl */}
                <div className="relative w-full aspect-square rounded-4xl overflow-hidden mb-6">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h4 className="text-xl font-bold text-[#0B1F3A]">
                  {member.name}
                </h4>
                <p className="text-xs font-bold text-[#C9A84C] uppercase tracking-widest mt-1">
                  {member.role}
                </p>

                <div className="flex justify-center gap-4 mt-6">
                  <Linkedin
                    size={16}
                    className="text-gray-300 hover:text-[#C9A84C] cursor-pointer"
                  />
                  <Instagram
                    size={16}
                    className="text-gray-300 hover:text-[#C9A84C] cursor-pointer"
                  />
                </div>
              </m.div>
            ))}
          </div>
        </section>

        {/* --- UBICACIÓN --- */}
        <section className="bg-white rounded-[4rem] p-12 md:p-20 border border-gray-100 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl font-black text-[#0B1F3A] mb-6">
              Estamos en toda Latinoamérica.
            </h2>
            <button className="bg-[#0B1F3A] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-950 transition-all">
              Ver en Google Maps <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
