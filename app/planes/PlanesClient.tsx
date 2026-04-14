"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Zap, Star, Shield, ArrowRight,
  Video, CreditCard, DollarSign, Bitcoin,
  Smartphone, Wallet,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";

type Plan = {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string | null;
  hasLiveAccess: boolean;
  moduleIds: string[];
  paymentMethods: string[];
  isActive: boolean;
};

type Section = { id: string; name: string; icon: string };

const CARD_COLORS = ["indigo", "purple", "dark"] as const;
type CardColor = typeof CARD_COLORS[number];

const PAYMENT_LABELS: Record<string, { label: string; Icon: React.ElementType }> = {
  STRIPE:     { label: "Tarjeta",      Icon: CreditCard },
  PAYPAL:     { label: "PayPal",       Icon: DollarSign },
  BINANCE:    { label: "Binance Pay",  Icon: Bitcoin },
  ZELLE:      { label: "Zelle",        Icon: Zap },
  PAGO_MOVIL: { label: "Pago Móvil",   Icon: Smartphone },
  USDT:       { label: "USDT",         Icon: Wallet },
};

function DynamicIcon({ name, size = 12 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as Record<string, any>)[name];
  if (!Icon) return null;
  return <Icon size={size} />;
}

function colorStyles(color: CardColor, suggested: boolean) {
  if (suggested) {
    return {
      card: "border-[#5A4FCF] shadow-xl shadow-indigo-100 scale-105 z-10",
      badge: "bg-indigo-50 text-indigo-600",
      btn: "bg-[#5A4FCF] text-white shadow-xl shadow-indigo-200 hover:bg-[#483ecb]",
    };
  }
  if (color === "dark") {
    return {
      card: "border-gray-100",
      badge: "bg-gray-100 text-gray-800",
      btn: "bg-[#1A1A2E] text-white hover:bg-black",
    };
  }
  const map = {
    indigo: { card: "border-gray-100", badge: "bg-indigo-50 text-indigo-600", btn: "bg-[#1A1A2E] text-white hover:bg-black" },
    purple: { card: "border-gray-100", badge: "bg-purple-50 text-purple-600", btn: "bg-[#1A1A2E] text-white hover:bg-black" },
  };
  return map[color] ?? map.indigo;
}

export default function PlanesClient({
  plans,
  sections,
}: {
  plans: Plan[];
  sections: Section[];
}) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s]));

  const featuredIdx = plans.length > 1
    ? plans.findIndex((p) => p.hasLiveAccess) !== -1
      ? plans.findIndex((p) => p.hasLiveAccess)
      : Math.floor(plans.length / 2)
    : 0;

  function displayPrice(price: number) {
    if (billing === "yearly") return (price * 12 * 0.8).toFixed(0);
    return price.toFixed(0);
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block bg-indigo-50 text-[#5A4FCF] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
        >
          Membresías
        </motion.div>
        <h1 className="text-5xl md:text-8xl font-black text-[#1A1A2E] tracking-tighter mb-8 leading-[0.9]">
          Inversión en tu <br />
          <span className="text-[#5A4FCF] italic">Crecimiento.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Elige el plan que mejor se adapte a tu nivel y comienza a escalar tus habilidades hoy.
        </p>

        <div className="mt-12 flex items-center justify-center gap-4">
          <span className={`text-sm font-bold ${billing === "monthly" ? "text-[#1A1A2E]" : "text-gray-400"}`}>
            Mensual
          </span>
          <button
            onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
            className="w-14 h-8 bg-[#1A1A2E] rounded-full relative p-1 transition-all"
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${
                billing === "yearly" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className={`text-sm font-bold ${billing === "yearly" ? "text-[#1A1A2E]" : "text-gray-400"}`}>
            Anual <span className="text-green-500 text-[10px] ml-1">(-20%)</span>
          </span>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200 mb-20">
          <Star className="mx-auto text-gray-200 mb-4" size={48} />
          <p className="text-gray-400 font-bold">No hay planes disponibles en este momento.</p>
        </div>
      ) : (
        <div className={`grid gap-8 mb-32 ${
          plans.length === 1 ? "grid-cols-1 max-w-md mx-auto" :
          plans.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto" :
          "grid-cols-1 md:grid-cols-3"
        }`}>
          {plans.map((plan, idx) => {
            const suggested = idx === featuredIdx;
            const color = CARD_COLORS[idx % CARD_COLORS.length];
            const styles = colorStyles(color, suggested);
            const includedModules = plan.moduleIds
              .map((id) => sectionMap[id])
              .filter(Boolean);

            const features: { text: string; icon?: React.ReactNode }[] = [];
            if (plan.description) features.push({ text: plan.description });
            if (plan.hasLiveAccess) features.push({ text: "Acceso completo a Lives en vivo", icon: <Video size={12} className="text-green-500" /> });
            includedModules.forEach((s) => features.push({ text: s.name, icon: <DynamicIcon name={s.icon} size={12} /> }));

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-white rounded-[3.5rem] p-10 border shadow-sm transition-all hover:shadow-2xl hover:shadow-indigo-100 group ${styles.card}`}
              >
                {suggested && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#5A4FCF] text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Recomendado
                  </div>
                )}

                <div className="mb-8">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg mb-4 inline-block ${styles.badge}`}>
                    {plan.slug}
                  </span>
                  <h3 className="text-3xl font-black text-[#1A1A2E] mb-2">{plan.name}</h3>
                </div>

                <div className="flex items-end gap-1 mb-2">
                  <span className="text-6xl font-black text-[#1A1A2E] tracking-tighter">
                    ${displayPrice(plan.price)}
                  </span>
                  <span className="text-gray-400 font-bold mb-2 uppercase text-[10px] tracking-widest">
                    / {billing === "yearly" ? "Año" : "Mes"}
                  </span>
                </div>
                {billing === "yearly" && (
                  <p className="text-xs text-green-600 font-bold mb-6">
                    Equivale a ${plan.price.toFixed(0)}/mes · Ahorras ${(plan.price * 12 * 0.2).toFixed(0)}/año
                  </p>
                )}

                {features.length > 0 && (
                  <div className="space-y-4 mb-8 mt-6">
                    <p className="text-[10px] font-black text-[#5A4FCF] uppercase tracking-widest border-b border-gray-50 pb-2">
                      ¿Qué incluye?
                    </p>
                    {features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
                          {f.icon ?? <Check size={12} className="text-green-500" />}
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-tight">{f.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {plan.paymentMethods.length > 0 && (
                  <div className="mb-8">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                      Métodos de pago
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {plan.paymentMethods.map((key) => {
                        const meta = PAYMENT_LABELS[key];
                        if (!meta) return null;
                        const { Icon, label } = meta;
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg"
                          >
                            <Icon size={11} /> {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Link href="/auth/signup">
                  <button
                    className={`w-full py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs ${styles.btn}`}
                  >
                    Seleccionar Plan <ArrowRight size={18} />
                  </button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

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
                  <p className="text-sm text-gray-400">Puedes escalar o bajar de nivel según tus necesidades sin penalizaciones.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Pagos 100% seguros</h4>
                  <p className="text-sm text-gray-400">Múltiples métodos de pago disponibles según el plan que elijas.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-10 border border-white/10">
            <Star className="text-yellow-400 mb-6" size={32} />
            <p className="text-xl font-medium leading-relaxed mb-8 italic">
              "La suscripción me permitió acceder a cursos y lives en vivo. Aprendí más en un mes que en un año solo."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-600 rounded-full" />
              <div>
                <p className="font-bold">Ana María Silva</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Estudiante</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#5A4FCF]/20 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
