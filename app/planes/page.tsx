"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Zap, Star, Shield, ArrowRight, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const PLANS = [
  {
    name: "Plan Esencial",
    badge: "Básico",
    price: "29",
    description: "Para dar tus primeros pasos en el mundo digital.",
    idealFor: "Personas que están empezando desde cero.",
    features: [
      "Acceso a cursos nivel Principiante",
      "Soporte por Discord",
      "Certificado Digital",
      "Material descargable"
    ],
    color: "indigo",
    level: "Principiante"
  },
  {
    name: "Plan Profesional",
    badge: "Estándar",
    price: "49",
    suggested: true,
    description: "Especialízate y domina herramientas avanzadas.",
    idealFor: "Personas que ya tienen base y buscan especializarse.",
    features: [
      "Cursos Principiante + Intermedio",
      "Todo lo del Plan Esencial",
      "Mentorías grupales semanales",
      "Acceso prioritario a eventos"
    ],
    color: "purple",
    level: "Principiante + Intermedio"
  },
  {
    name: "Plan Elite / Master",
    badge: "Premium",
    price: "79",
    description: "El dominio absoluto de la tecnología y medios.",
    idealFor: "Profesionales que buscan el dominio total.",
    features: [
      "Todo el catálogo (Sin límites)",
      "Niveles: Principiante, Intermedio y Avanzado",
      "Sesiones 1 a 1 con Fundadores",
      "Acceso a Beta de Lab Artica"
    ],
    color: "black",
    level: "Completo"
  }
];

export default function PlanesPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <main className="min-h-screen bg-[#F4F4F7] pt-32 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        {/* --- CABECERA --- */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block bg-indigo-50 text-[#5A4FCF] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
          >
            Membresías ARTICADEMY
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-black text-[#1A1A2E] tracking-tighter mb-8 leading-[0.9]">
            Inversión en tu <br />
            <span className="text-[#5A4FCF] italic">Crecimiento.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Elige el plan que mejor se adapte a tu nivel actual y comienza a escalar tus habilidades hoy mismo.
          </p>

          {/* Toggle de facturación (opcional pero le da premium feel) */}
          <div className="mt-12 flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${billingCycle === "monthly" ? "text-[#1A1A2E]" : "text-gray-400"}`}>Mensual</span>
            <button 
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="w-14 h-8 bg-[#1A1A2E] rounded-full relative p-1 transition-all"
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"}`} />
            </button>
            <span className={`text-sm font-bold ${billingCycle === "yearly" ? "text-[#1A1A2E]" : "text-gray-400"}`}>
              Anual <span className="text-green-500 text-[10px] ml-1">(-20%)</span>
            </span>
          </div>
        </div>

        {/* --- GRID DE PLANES --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative bg-white rounded-[3.5rem] p-10 border shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-100 group ${
                plan.suggested ? "border-[#5A4FCF] shadow-xl shadow-indigo-100 scale-105 z-10" : "border-gray-100"
              }`}
            >
              {plan.suggested && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#5A4FCF] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  Recomendado
                </div>
              )}

              <div className="mb-8">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg mb-4 inline-block ${
                  plan.color === "indigo" ? "bg-indigo-50 text-indigo-600" :
                  plan.color === "purple" ? "bg-purple-50 text-purple-600" : "bg-gray-100 text-gray-800"
                }`}>
                  {plan.badge}
                </span>
                <h3 className="text-3xl font-black text-[#1A1A2E] mb-2">{plan.name}</h3>
                <p className="text-sm text-gray-500 font-medium">{plan.description}</p>
              </div>

              <div className="flex items-end gap-1 mb-8">
                <span className="text-6xl font-black text-[#1A1A2E] tracking-tighter">${plan.price}</span>
                <span className="text-gray-400 font-bold mb-2 uppercase text-[10px] tracking-widest">/ Mes</span>
              </div>

              <div className="space-y-6 mb-12">
                <p className="text-[10px] font-black text-[#5A4FCF] uppercase tracking-widest border-b border-gray-50 pb-2">¿Qué incluye?</p>
                <div className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-green-500 font-bold" />
                      </div>
                      <p className="text-sm text-gray-600 font-medium leading-tight">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ideal para:</p>
                <p className="text-xs font-bold text-[#1A1A2E]">{plan.idealFor}</p>
              </div>

              <button className={`w-full py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs ${
                plan.suggested 
                  ? "bg-[#5A4FCF] text-white shadow-xl shadow-indigo-200 hover:bg-[#483ecb]" 
                  : "bg-[#1A1A2E] text-white hover:bg-black"
              }`}>
                Seleccionar Plan <ArrowRight size={18} />
              </button>
            </motion.div>
          ))}
        </div>

        {/* --- FAQ / INFO EXTRA --- */}
        <div className="bg-[#1A1A2E] rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 tracking-tighter">
                ¿Aún tienes dudas? <br />
                <span className="text-indigo-400">Te ayudamos a decidir.</span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Zap size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Cambio de plan en cualquier momento</h4>
                    <p className="text-sm text-gray-400">Puedes escalar o bajar de nivel según tus necesidades mensuales sin penalizaciones.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Shield size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Pagos 100% seguros</h4>
                    <p className="text-sm text-gray-400">Aceptamos Zelle, USDT y Pago Móvil para tu comodidad.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10">
              <Star className="text-yellow-400 mb-6" size={32} />
              <p className="text-xl font-medium leading-relaxed mb-8 italic">
                "La suscripción Elite me permitió dominar desde After Effects hasta Estrategia de Medios en un solo semestre. ¡La mejor inversión!"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-400 rounded-full overflow-hidden" />
                <div>
                  <p className="font-bold">Ana Maria Silva</p>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Estudiante Elite</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#5A4FCF]/20 blur-[120px] rounded-full" />
        </div>
      </div>

      <Footer />
    </main>
  );
}
