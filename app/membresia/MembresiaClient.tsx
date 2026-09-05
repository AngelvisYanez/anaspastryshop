"use client";

import { m } from "framer-motion";
import {
  Check, ArrowRight, Shield, Zap, Star,
  Video, CreditCard, DollarSign,
  Smartphone, Building2,
  CheckCircle, BookOpen, RefreshCw, AlertTriangle,
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

type ActiveSubscription = {
  daysLeft: number | null;
  endDate: string | null;
  planName: string;
};

const PAYMENT_META: Record<string, {
  label: string;
  Icon: React.ElementType;
  type: "automatic" | "manual";
  description: string;
}> = {
  STRIPE:        { label: "Tarjeta de crédito/débito", Icon: CreditCard, type: "automatic", description: "Visa, Mastercard, American Express" },
  PAYPAL:        { label: "PayPal",                    Icon: DollarSign, type: "automatic", description: "Pago instantáneo con tu cuenta PayPal" },
  ZELLE:         { label: "Zelle",                     Icon: Zap,        type: "manual",    description: "Transferencia directa desde tu banco" },
  PAGO_MOVIL:    { label: "Pago Móvil",                Icon: Smartphone, type: "manual",    description: "Transferencia desde tu banco móvil" },
  BANK_TRANSFER: { label: "Transferencia Bancaria",    Icon: Building2,  type: "manual",    description: "ACH / Wire Transfer bancaria" },
};

const BENEFITS = [
  "Acceso ilimitado a todos los cursos de la plataforma",
  "Sesiones en vivo con instructores especializados",
  "Actualizaciones constantes con contenido nuevo cada mes",
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
  enabledProviders,
  activeSubscription = null,
  bienvenida = false,
}: {
  plan: Plan | null;
  sections: Section[];
  enabledProviders: string[];
  activeSubscription?: ActiveSubscription | null;
  bienvenida?: boolean;
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

  const isExpiringSoon = activeSubscription?.daysLeft !== null && activeSubscription?.daysLeft !== undefined && activeSubscription.daysLeft <= 7 && activeSubscription.daysLeft > 0;
  const isExpired = activeSubscription?.daysLeft !== null && activeSubscription?.daysLeft !== undefined && activeSubscription.daysLeft <= 0;

  return (
    <>
      {bienvenida && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <Check size={16} className="text-green-600" />
              </div>
              <div>
                <p className="font-black text-green-800 text-sm">¡Cuenta creada exitosamente!</p>
                <p className="text-green-700 text-xs font-medium">Activa tu membresía para acceder a todos los cursos, lives y webinars.</p>
              </div>
            </div>
            <Link href="/iniciar-sesion" className="text-xs font-bold text-green-700 hover:underline shrink-0">
              ¿Ya tienes membresía? Inicia sesión →
            </Link>
          </div>
        </div>
      )}
      <div className="relative overflow-hidden bg-[#0B1F3A] pt-32 pb-20 px-8 md:px-20 rounded-b-3xl mb-16 text-center">
        <div className="absolute inset-0 opacity-[0.025] noise-bg pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[0%] w-[30%] h-[30%] bg-accent/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block bg-white/[0.08] border border-white/[0.1] text-accent px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest mb-6"
          >
            Membresía única
          </m.div>
          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[0.9]"
          >
            Todo lo que necesitas,
            <br />
            <span className="text-accent italic">en un solo plan.</span>
          </m.h1>
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-white/55 max-w-2xl mx-auto leading-relaxed"
          >
            Una membresía mensual que te da acceso completo a cursos, sesiones en vivo y
            una comunidad activa que aprende junta a dominar el mundo digital.
          </m.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20 items-start">

          {activeSubscription ? (
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative overflow-hidden bg-[#0B1F3A] text-white rounded-2xl p-10 md:p-14"
            >
              <div className="absolute inset-0 rounded-2xl opacity-[0.03] noise-bg pointer-events-none" />
              <div className="absolute top-[-15%] right-[-10%] w-72 h-72 bg-accent/15 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle size={20} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Membresía Activa</p>
                    <p className="text-sm text-white/50">{activeSubscription.planName}</p>
                  </div>
                </div>

                {activeSubscription.endDate && (
                  <>
                    <div className="mb-2">
                      <span className="font-display text-8xl font-black tracking-tight leading-none">
                        {isExpired ? "0" : (activeSubscription.daysLeft !== null ? Math.max(0, activeSubscription.daysLeft) : "∞")}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-2">
                      {isExpired ? "días — membresía vencida" : "días restantes"}
                    </p>
                    <p className="text-white/30 text-xs mb-10">
                      {isExpired ? "Tu membresía venció el " : "Se renueva el "}{activeSubscription.endDate}
                    </p>

                    {isExpiringSoon && !isExpired && (
                      <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
                        <AlertTriangle size={16} className="text-amber-400 shrink-0" />
                        <p className="text-xs text-amber-300 font-bold">Tu membresía vence pronto. Renueva para no perder el acceso.</p>
                      </div>
                    )}

                    {isExpired ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-2">
                          <AlertTriangle size={16} className="text-red-400 shrink-0" />
                          <p className="text-xs text-red-300 font-bold">Tu acceso ha expirado. Renueva para continuar aprendiendo.</p>
                        </div>
                        <Link href="/pagar/membresia">
                          <button className="w-full bg-accent text-[#0B1F3A] py-5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-accent-hover hover:scale-[1.02] transition-all shadow-xl shadow-accent/20 text-sm uppercase tracking-widest">
                            <RefreshCw size={16} /> Renovar Membresía
                          </button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link href="/cursos">
                          <button className="w-full bg-accent text-[#0B1F3A] py-5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-accent-hover hover:scale-[1.02] transition-all shadow-xl shadow-accent/20 text-sm uppercase tracking-widest">
                            <BookOpen size={16} /> Ver mis cursos
                          </button>
                        </Link>
                        {isExpiringSoon && (
                          <Link href="/pagar/membresia">
                            <button className="w-full bg-white/[0.06] border border-white/[0.1] text-white/60 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/[0.1] transition-all text-xs uppercase tracking-widest">
                              <RefreshCw size={14} /> Renovar membresía
                            </button>
                          </Link>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="mt-8 pt-8 border-t border-white/[0.08] space-y-3">
                  {allFeatures.slice(0, 4).map((f) => (
                    <div key={f.text} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-accent/20 rounded-full flex items-center justify-center shrink-0 text-accent">
                        {f.icon ?? <Check size={12} />}
                      </div>
                      <p className="text-xs text-white/40 leading-snug">{f.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </m.div>
          ) : (
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative overflow-hidden bg-[#0B1F3A] dark:bg-card text-white rounded-2xl p-10 md:p-14"
            >
              <div className="absolute inset-0 rounded-2xl opacity-[0.03] noise-bg pointer-events-none" />
              <div className="absolute top-[-15%] right-[-10%] w-72 h-72 bg-accent/15 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent/80 mb-6 block">
                  {plan?.name ?? "Membresía Academia"}
                </span>

                <div className="flex items-end gap-2 mb-2">
                  {price !== null ? (
                    <>
                      <span className="font-display text-7xl font-black tracking-tight text-white italic">${price}</span>
                      <span className="text-white/40 font-bold mb-3 text-sm">/mes</span>
                    </>
                  ) : (
                    <span className="font-display text-5xl font-black tracking-tight text-white italic">Próximamente</span>
                  )}
                </div>
                {price !== null && (
                  <p className="text-white/40 text-sm mb-10">
                    Facturación mensual · Cancela cuando quieras
                  </p>
                )}

                <div className="space-y-4 mb-10">
                  {allFeatures.map((f) => (
                    <div key={f.text} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-accent">
                        {f.icon ?? <Check size={14} />}
                      </div>
                      <p className="text-sm text-white/65 leading-snug">{f.text}</p>
                    </div>
                  ))}
                </div>

                <Link href="/pagar/membresia">
                  <button className="w-full bg-accent text-[#0B1F3A] py-5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-accent-hover hover:scale-[1.02] transition-all shadow-xl shadow-accent/20 text-sm uppercase tracking-widest">
                    Quiero unirme ahora <ArrowRight size={18} />
                  </button>
                </Link>
              </div>
            </m.div>
          )}

          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col gap-6"
          >
            {(() => {
              const activeMethods = (plan?.paymentMethods ?? []).filter((m) =>
                enabledProviders.includes(m)
              );
              if (activeMethods.length === 0) return null;
              const automatic = activeMethods.filter((m) => PAYMENT_META[m]?.type === "automatic");
              const manual = activeMethods.filter((m) => PAYMENT_META[m]?.type === "manual");
              return (
                <div className="bg-card rounded-xl p-8 border border-card-border">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-6">
                    Métodos de pago aceptados
                  </h3>
                  <div className="flex flex-col gap-3">
                    {automatic.length > 0 && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60 mb-1">
                          Automático
                        </p>
                        {automatic.map((key) => {
                          const meta = PAYMENT_META[key];
                          if (!meta) return null;
                          const { Icon, label, description } = meta;
                          return (
                            <div key={key} className="flex items-center gap-3 bg-section-alt rounded-xl px-4 py-3 border border-card-border">
                              <div className="w-9 h-9 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                                <Icon size={17} className="text-accent" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground leading-none mb-0.5">{label}</p>
                                <p className="text-xs text-muted truncate">{description}</p>
                              </div>
                              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-full shrink-0">
                                Instantáneo
                              </span>
                            </div>
                          );
                        })}
                      </>
                    )}
                    {manual.length > 0 && (
                      <>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60 mb-1 mt-2">
                          Manual
                        </p>
                        {manual.map((key) => {
                          const meta = PAYMENT_META[key];
                          if (!meta) return null;
                          const { Icon, label, description } = meta;
                          return (
                            <div key={key} className="flex items-center gap-3 bg-section-alt rounded-xl px-4 py-3 border border-card-border">
                              <div className="w-9 h-9 bg-foreground/5 rounded-lg flex items-center justify-center shrink-0">
                                <Icon size={17} className="text-muted" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground leading-none mb-0.5">{label}</p>
                                <p className="text-xs text-muted truncate">{description}</p>
                              </div>
                              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-muted bg-foreground/5 px-2 py-0.5 rounded-full shrink-0">
                                Manual
                              </span>
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="bg-card rounded-xl p-8 border border-card-border">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted mb-6">
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
                    <p className="text-muted text-sm leading-snug">El mundo digital cambia. Nosotros te mantenemos al día siempre.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-section-alt rounded-xl p-8 border border-card-border relative overflow-hidden">
              <span className="font-display absolute top-2 left-5 text-[5rem] leading-none text-accent/[0.08] font-black italic select-none pointer-events-none">
                &ldquo;
              </span>
              <Star className="text-accent mb-4 relative z-10" size={22} />
              <p className="text-foreground leading-relaxed mb-6 italic text-sm relative z-10">
                "Me uní hace 3 meses y ya domino herramientas que me abrieron puertas en mi trabajo. El acceso a los lives marca la diferencia."
              </p>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-foreground rounded-full flex items-center justify-center">
                  <span className="font-display text-xs font-black text-background italic">AM</span>
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
          className="relative overflow-hidden bg-[#0B1F3A] dark:bg-card rounded-2xl p-12 md:p-16 text-center text-white mb-4"
        >
          <div className="absolute inset-0 rounded-2xl opacity-[0.03] noise-bg pointer-events-none" />
          <div className="absolute top-[-15%] right-[-10%] w-80 h-80 bg-accent/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            {activeSubscription && !isExpired ? (
              <>
                <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                  ¡Bienvenido de vuelta,
                  <br />
                  <span className="text-accent italic">sigue aprendiendo!</span>
                </h2>
                <p className="text-white/45 max-w-xl mx-auto mb-10 leading-relaxed">
                  Tienes acceso completo a todos los cursos y recursos de la plataforma.
                </p>
                <Link href="/cursos">
                  <button className="bg-accent text-[#0B1F3A] px-12 py-5 rounded-xl font-bold text-sm flex items-center gap-3 mx-auto hover:bg-accent-hover hover:scale-[1.03] transition-all shadow-xl shadow-accent/20 uppercase tracking-widest">
                    <BookOpen size={18} /> Ir a mis cursos
                  </button>
                </Link>
              </>
            ) : (
              <>
                <h2 className="font-display text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
                  ¿Listo para transformar
                  <br />
                  <span className="text-accent italic">tus habilidades digitales?</span>
                </h2>
                <p className="text-white/45 max-w-xl mx-auto mb-10 leading-relaxed">
                  Únete a nuestra comunidad y empieza a construir el perfil profesional que siempre quisiste.
                </p>
                <Link href="/pagar/membresia">
                  <button className="bg-accent text-[#0B1F3A] px-12 py-5 rounded-xl font-bold text-sm flex items-center gap-3 mx-auto hover:bg-accent-hover hover:scale-[1.03] transition-all shadow-xl shadow-accent/20 uppercase tracking-widest">
                    {activeSubscription ? <><RefreshCw size={18} /> Renovar membresía</> : <>Quiero unirme ahora <ArrowRight size={18} /></>}
                  </button>
                </Link>
              </>
            )}
          </div>
        </m.div>
      </div>
    </>
  );
}
