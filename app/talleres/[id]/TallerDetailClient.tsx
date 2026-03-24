"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Coffee,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import CheckoutModal from "@/components/CheckoutModal";

export default function TallerDetailClient({ taller }: { taller: any }) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Parsear la data JSON y CSV
  const agenda = typeof taller.agenda === "string" ? JSON.parse(taller.agenda || "[]") : [];
  const includes = typeof taller.includes === "string" ? taller.includes.split(",") : [];

  return (
    <main className="min-h-screen bg-[#F4F4F7] pt-28 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        {/* --- BREADCRUMBS --- */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">
          <Link
            href="/talleres"
            className="hover:text-[#5A4FCF] transition-colors"
          >
            Talleres
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-300">{taller.category}</span>
          <ChevronRight size={12} />
          <span className="text-[#1A1A2E]">{taller.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* --- COLUMNA IZQUIERDA --- */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                  Presencial
                </span>
                <span className="text-green-600 font-bold text-xs flex items-center gap-1">
                  <Users size={14} /> Quedan {taller.slots} cupos
                </span>
              </div>

              <h1 className="text-4xl md:text-7xl font-black text-[#1A1A2E] mb-6 leading-[0.9] tracking-tighter">
                {taller.title}
              </h1>

              <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl">
                {taller.description}
              </p>

              {/* Agenda del Día */}
              {agenda.length > 0 && (
                <>
                  <h2 className="text-3xl font-bold mb-8">Agenda del Taller</h2>
                  <div className="space-y-4 mb-16">
                    {agenda.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-6 shadow-sm group hover:border-[#5A4FCF] transition-all"
                      >
                        <div className="text-sm font-black text-[#5A4FCF] w-20 flex-shrink-0">
                          {item.hour}
                        </div>
                        <div className="h-8 w-px bg-gray-100" />
                        <div className="text-gray-700 font-bold">{item.task}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Qué incluye */}
              {includes.length > 0 && (
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 mb-10">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <Coffee className="text-[#5A4FCF]" /> ¿Qué incluye tu
                    inscripción?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {includes.map((item: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 text-gray-500 font-medium"
                      >
                        <CheckCircle2 className="text-green-500" size={18} />{" "}
                        {item.trim()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* --- COLUMNA DERECHA (STICKY TICKET) --- */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="space-y-6 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#5A4FCF]">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Fecha
                        </p>
                        <p className="font-bold text-[#1A1A2E]">
                          {new Date(taller.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#5A4FCF]">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Horario
                        </p>
                        <p className="font-bold text-[#1A1A2E]">
                          {taller.time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#5A4FCF]">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Lugar
                        </p>
                        <p className="font-bold text-[#1A1A2E]">
                          {taller.location}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end gap-2 mb-8 border-t border-gray-50 pt-8">
                    <span className="text-6xl font-black text-[#1A1A2E] tracking-tighter">
                      ${taller.price}
                    </span>
                    <span className="text-gray-400 font-bold mb-3 uppercase text-[10px] tracking-widest">
                      Inversión Única
                    </span>
                  </div>

                  <button
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full bg-[#1A1A2E] text-white py-6 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-[#5A4FCF] transition-all shadow-xl shadow-indigo-100 mb-6 uppercase tracking-widest text-xs"
                  >
                    Asegurar mi cupo <ArrowRight size={18} />
                  </button>

                  <p className="text-[10px] text-center text-gray-400 font-medium">
                    Inscripción inmediata vía Zelle, USDT o BCV.
                  </p>
                </div>
              </div>

              {/* Card de Mentor */}
              <div className="bg-[#1A1A2E] rounded-[2.5rem] p-8 text-white flex items-center gap-5 border border-white/5">
                <div className="w-16 h-16 bg-white rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-[#1A1A2E] text-xl overflow-hidden">
                  {taller.instructor?.image ? (
                    <img src={taller.instructor.image} alt={taller.instructor.name} className="w-full h-full object-cover" />
                  ) : (
                    (taller.instructor?.name || "MD")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                    Instructor
                  </p>
                  <p className="text-xl font-bold tracking-tight">
                    {taller.instructor?.name || "Sin asignar"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title={taller.title}
        tallerId={taller.id}
        price={taller.price}
      />

      <Footer />
    </main>
  );
}
