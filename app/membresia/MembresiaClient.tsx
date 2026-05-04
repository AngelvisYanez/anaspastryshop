"use client";

import { m } from "framer-motion";
import {
  Check, ArrowRight, Shield, Zap, Star,
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
};

type Section = { id: string; name: string; icon: string };

const PAYMENT_LABELS: Record<string, { label: string; Icon: React.ElementType }> = {
  STRIPE:     { label: "Tarjeta de crédito/débito", Icon: CreditCard },
  PAYPAL:     { label: "PayPal",                    Icon: DollarSign },
  BINANCE:    { label: "Binance Pay",               Icon: Bitcoin },
  ZELLE:      { label: "Zelle",                     Icon: Zap },
  PAGO_MOVIL: { label: "Pago Móvil",                Icon: Smartphone },
  USDT:       { label: "USDT / Cripto",             Icon: Wallet },
};

const BENEFITS = [
  "Acceso ilimitado a todos los cursos de la plataforma",
  "Sesiones en vivo con instructores especializados",
  "Actualizaciones constantes sobre el sistema crediticio americano",
  "Comunidad activa de miembros",
  "Material descargable y recursos exclusivos",
  "Soporte directo por comunidad",
];

function DynamicIcon({ name }: { name: string }) {
  const Icon = (LucideIcons as Record<string, any>)[name];
  if (!Icon) return null;
  return <Icon size={14} />;
}

export default function MembresiaClient({
  plan,
  sections,
}: {
  plan: Plan | null;
  sections: Section[];
}) {
  const sectionMap = Object.fromEntries(sections.map((s) => [s.id, s]));
  const price = plan?.price ?? null;

  const features: { text: string; icon?: React.ReactNode }[] = [];
  if (plan?.hasLiveAccess) {
    features.push({ text: "Acceso completo a lives y webinars en vivo", icon: <Video size={14} className="text-accent" /> });
  }
  plan?.moduleIds.forEach((id) => {
    const s = sectionMap[id];
    if (s) features.push({ text: s.name, icon: <DynamicIcon name={s.icon} /> });
  });
  const allFeatures: { text: string; icon?: React.ReactNode }[] = features.length > 0 ? features : BENEFITS.map((text) => ({ text }));

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-20">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-block bg-accent-subtle text-accent px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6"
        >
          Membresía única
        </m.div>
        <m.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-foreground tracking-tighter mb-6 leading-[0.9]"
        >
          Todo lo que necesitas,<br />
          <span className="text-accent italic">en un solo plan.</span>
        </m.h1>
        <m.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-muted max-w-2xl mx-auto leading-relaxed"
        >
          Una membresía mensual que te da acceso completo a cursos, sesiones en vivo y
          una comunidad activa enfocada en el sistema crediticio americano.
        </m.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 items-start">
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-navy text-white rounded-[3rem] p-10 md:p-14 relative overflow-hidden"
        >
          <div className="absolute top-[-15%] right-[-10%] w-72 h-72 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-accent/80 mb-6 block">
              {plan?.name ?? "Membresía Academia"}
            </span>

            <div className="flex items-end gap-2 mb-2">
              {price !== null ? (
                <>
                  <span className="text-7xl font-black tracking-tighter text-white">${price}</span>
                  <span className="text-gray-400 font-bold mb-3 text-sm">/mes</span>
                </>
              ) : (
                <span className="text-5xl font-black tracking-tighter text-white">Próximamente</span>
              )}
            </div>
            {price !== null && (
              <p className="text-gray-500 text-sm mb-10">
                Facturación mensual · Cancela cuando quieras
              </p>
            )}

            <div className="space-y-4 mb-10">
              {allFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-accent">
                    {f.icon ?? <Check size={14} />}
                  </div>
                  <p className="text-sm text-gray-300 leading-snug">{f.text}</p>
                </div>
              ))}
            </div>

            <Link href="/auth/signup">
              <button className="w-full bg-accent text-navy py-5 rounded-[2rem] font-bold flex items-center justify-center gap-3 hover:opacity-90 hover:scale-[1.02] transition-all shadow-xl shadow-accent/20 text-sm uppercase tracking-widest">
                Quiero unirme ahora <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-6"
        >
          <div className="bg-card rounded-[2.5rem] p-8 border border-card-border">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-6">
              Métodos de pago aceptados
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {(plan?.paymentMethods ?? Object.keys(PAYMENT_LABELS)).map((key) => {
                const meta = PAYMENT_LABELS[key];
                if (!meta) return null;
                const { Icon, label } = meta;
                return (
                  <div key={key} className="flex items-center gap-3 bg-section-alt rounded-2xl px-4 py-3 border border-card-border">
                    <Icon size={16} className="text-accent shrink-0" />
                    <span className="text-sm font-semibold text-foreground">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card rounded-[2.5rem] p-8 border border-card-border">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted mb-6">
              Por qué elegirnos
            </h3>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-accent-subtle rounded-xl flex items-center justify-center shrink-0 text-accent">
                  <Zap size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm mb-1">Sin contratos largos</h4>
                  <p className="text-muted text-sm leading-snug">Membresía mensual, cancela cuando quieras sin penalizaciones.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-accent-subtle rounded-xl flex items-center justify-center shrink-0 text-accent">
                  <Shield size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm mb-1">Contenido actualizado</h4>
                  <p className="text-muted text-sm leading-snug">El sistema crediticio cambia. Nosotros te mantenemos al día siempre.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-section-alt rounded-[2.5rem] p-8 border border-card-border">
            <Star className="text-accent mb-4" size={24} />
            <p className="text-foreground font-medium leading-relaxed mb-6 italic text-sm">
              "Me uní hace 3 meses y ya entiendo el sistema crediticio americano mejor que muchos asesores. El acceso a los lives marca la diferencia."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center text-white font-bold text-sm">
                AM
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">Ana María Silva</p>
                <p className="text-xs text-muted uppercase tracking-widest">Miembro activa</p>
              </div>
            </div>
          </div>
        </m.div>
      </div>

      <m.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-navy rounded-[3rem] p-12 md:p-16 text-center text-white relative overflow-hidden mb-4"
      >
        <div className="absolute top-[-15%] right-[-10%] w-80 h-80 bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4 leading-tight">
            ¿Listo para transformar <br />
            <span className="text-accent italic">tu historial crediticio?</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Únete a nuestra comunidad y empieza a construir el perfil crediticio que siempre quisiste.
          </p>
          <Link href="/auth/signup">
            <button className="bg-accent text-navy px-12 py-5 rounded-full font-bold text-sm flex items-center gap-3 mx-auto hover:opacity-90 hover:scale-105 transition-all shadow-xl shadow-accent/20 uppercase tracking-widest">
              Quiero unirme ahora <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </m.div>
    </div>
  );
}
