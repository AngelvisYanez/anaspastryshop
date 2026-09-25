"use client";

import { m } from "framer-motion";
import {
  Clock, CreditCard, AlertTriangle, Sparkles, Calendar,
  CheckCircle2, MessageCircle, MapPin,
} from "lucide-react";

export interface WorkshopConditionsProps {
  showCta?: boolean;
  workshopTitle?: string;
  location?: string;
  workshopDate?: string;
  workshopTime?: string;
  price?: number;
  isDecorationWorkshop?: boolean;
}

export default function WorkshopConditions({
  showCta = true,
  workshopTitle,
  location,
  workshopDate,
  workshopTime,
  price,
  isDecorationWorkshop = false,
}: WorkshopConditionsProps) {
  const reservationAmount = price ? Math.round(price * 0.5) : null;
  const remainderAmount = price && reservationAmount ? price - reservationAmount : null;

  const conditions = [
    {
      icon: Clock,
      tag: "Horarios y Duración",
      accentColor: "border-pink-500/20 text-pink-700 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30",
      title: "Jornada Completa de 8 Horas",
      desc: `Inicio puntual a las ${workshopTime ? workshopTime.split("—")[0].trim() : "9:00 AM"}. Finalización estimada entre 4:00 PM y 5:00 PM. Se agradece puntualidad para aprovechar cada técnica y preparación al máximo.`,
      highlight: workshopTime || "9:00 AM a 5:00 PM",
    },
    {
      icon: CreditCard,
      tag: "Reserva y Modalidad de Pago",
      accentColor: "border-purple-500/20 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30",
      title: "50% de Reserva + 50% al Ingresar",
      desc: reservationAmount
        ? `El cupo se reserva formalmente con el 50% ($${reservationAmount} USD). Los $${remainderAmount} USD restantes deben ser cancelados el mismo día del taller al ingresar a clase. Métodos: Pago Móvil (Tasa BCV), Zelle, Binance Pay o Efectivo.`
        : "El cupo se reserva formalmente con el 50% del valor del workshop. El monto restante debe ser cancelado el mismo día del workshop al ingresar a clase. Métodos: Pago Móvil (Tasa BCV), Zelle, Binance Pay o Efectivo.",
      highlight: reservationAmount ? `Reserva $${reservationAmount} USD · Saldo $${remainderAmount} USD` : "Pago Móvil · Zelle · Binance · Efectivo",
    },
    {
      icon: AlertTriangle,
      tag: "Políticas de Cancelación",
      accentColor: "border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30",
      title: "Sin Excepción",
      desc: "Debido a que los ingresos se destinan de inmediato a la logística, insumos frescos y preparación individual del taller: si el participante no asiste, no se realizará la devolución del dinero abonado. Te recomendamos verificar bien tu disponibilidad antes de reservar.",
      highlight: "No reembolsable por logística e insumos",
    },
    {
      icon: Sparkles,
      tag: "Material & Herramientas",
      accentColor: "border-cyan-500/30 text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30",
      title: isDecorationWorkshop ? "Base Giratoria Requerida" : "Insumos & Guía Incluidos",
      desc: isDecorationWorkshop
        ? "Para este taller de alisado y decoración es indispensable traer tu propia base giratoria (bailarina). Si no cuentas con una, por favor infórmanos con anticipación para coordinar préstamo previo."
        : "Todos los insumos de alta calidad, recetarios y materiales de trabajo están incluidos para que vivas una experiencia práctica y te lleves tus creaciones a casa.",
      highlight: isDecorationWorkshop ? "Traer base giratoria (bailarina)" : "Todos los insumos incluidos",
    },
  ];

  return (
    <section id="condiciones-workshop" className="w-full py-16 px-4 md:px-8 my-12">
      <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
        <m.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mb-10"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-3">
            Condiciones y Logística de Nuestros{" "}
            <span className="text-pink-800">Workshops Presenciales</span>
          </h2>
          <p className="text-muted text-sm leading-relaxed max-w-md">
            {workshopTitle
              ? `Para garantizar la mejor experiencia y organización de este workshop (${workshopTitle}), por favor lee con atención las siguientes condiciones antes de formalizar tu inscripción.`
              : "Para garantizar la mejor experiencia, seguridad y organización de cada encuentro, te pedimos leer detenidamente las siguientes pautas antes de realizar tu reserva formal."}
          </p>
        </m.div>

        {/* Workshop Quick Location & Schedule Strip */}
        {(location || workshopDate || workshopTime) && (
          <div className="bg-section-alt/80 border border-card-border rounded-2xl p-4 sm:p-5 mb-8 flex flex-wrap items-center justify-between gap-4 text-xs">
            {location && (
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <MapPin size={16} className="text-pink-900 shrink-0" />
                <span><strong>Sede:</strong> {location}</span>
              </div>
            )}
            {workshopDate && (
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Calendar size={16} className="text-pink-900 shrink-0" />
                <span><strong>Fecha:</strong> {workshopDate}</span>
              </div>
            )}
            {workshopTime && (
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Clock size={16} className="text-pink-900 shrink-0" />
                <span><strong>Horario:</strong> {workshopTime}</span>
              </div>
            )}
          </div>
        )}

        {/* 4 Conditions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {conditions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <m.div
                key={item.tag}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="bg-background border border-card-border rounded-2xl p-6 hover:border-accent/30 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-pink-800">
                      {item.tag}
                    </span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.accentColor}`}>
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-black text-foreground mb-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted leading-relaxed mb-5 max-w-sm">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-card-border/70 flex items-center justify-between text-xs font-semibold">
                  <span className="text-foreground/70 flex items-center gap-1 text-[11px]">
                    <CheckCircle2 size={13} className="text-pink-800" /> Clave:
                  </span>
                  <span className="text-pink-800 font-bold text-[11px]">{item.highlight}</span>
                </div>
              </m.div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-brand-purple-mid via-brand-purple to-brand-purple-deep text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-pink-500/20 shadow-lg">
          <div className="max-w-2xl">
            <h4 className="font-display text-xl sm:text-2xl font-black text-white mb-2">
              ¡Estamos listos para aprender y crear juntos!
            </h4>
            <p className="text-white/75 text-xs sm:text-sm leading-relaxed max-w-sm">
              Recuerda que los grupos son reducidos para asegurar una atención personalizada y guiada de Anais Flores durante toda la jornada de 8 horas.
            </p>
          </div>

          {showCta && (
            <div className="shrink-0 w-full md:w-auto">
              <a
                href={`https://wa.me/?text=Hola%20Anais!%20He%20le%C3%ADdo%20las%20condiciones%20y%20deseo%20reservar%20mi%20cupo%20para%20el%20workshop:%20${encodeURIComponent(workshopTitle || "Workshop Presencial")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto bg-accent hover:bg-accent-hover text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-pink-600/30 flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} /> Consultar o Reservar Cupo
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
