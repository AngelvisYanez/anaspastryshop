import Link from "next/link";
import {
  AlertCircle, CheckCircle2, ArrowRight, MessageCircle,
} from "lucide-react";
import WorkshopConditions from "@/components/WorkshopConditions";
import AddToBagButton from "@/components/cart/AddToBagButton";

export function WorkshopDetailBody({
  workshop,
  depositAmount,
  balanceAmount,
  courseId,
  waUrl,
}: {
  workshop: {
    shortTitle: string;
    description: string;
    spots: number;
    price: number;
    schedule: string;
    duration: string;
    isDecorationWorkshop: boolean;
    legacySlug?: string | null;
    id: string;
    image?: string | null;
    realizaremos: string[];
    incluye: string[];
    studentRequirements: string;
  };
  depositAmount: number;
  balanceAmount: number;
  courseId: string;
  waUrl: string;
}) {
  return (
      <section className="py-14 sm:py-20 max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left Column: Workshop Program & Details */}
          <div className="lg:col-span-8 space-y-12">
            {/* Overview */}
            <div className="pt-3 border-t border-pink-400/15 space-y-4">
              <h2 className="text-2xl font-black text-foreground tracking-tight">
                Acerca de este Workshop Presencial
              </h2>
              <p className="text-sm sm:text-base text-muted leading-relaxed font-medium max-w-md">
                {workshop.description}
              </p>
              <div className="flex items-start gap-3 pl-4 border-l-2 border-amber-500/60 text-xs sm:text-sm text-muted font-medium">
                <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="max-w-sm">
                  <strong>Atención Personalizada:</strong> Los talleres cuentan con un cupo estricto de {workshop.spots} personas para garantizar que la Chef Anais Flores guíe tus movimientos, corrija tus posturas al usar la espátula o manga y resuelva todas tus dudas en vivo.
                </p>
              </div>
            </div>

            {/* Qué Realizaremos */}
            <div className="pt-3 border-t border-pink-400/15 space-y-6">
              <div className="border-b border-card-border pb-4">
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  ¿Qué Realizaremos en el Taller?
                </h2>
                <p className="text-xs sm:text-sm text-muted font-medium mt-1 max-w-sm">
                  Todas las preparaciones se elaboran desde cero siguiendo las técnicas y recetas probadas de Ana&apos;s Pastry Shop.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {workshop.realizaremos.map((item, idx) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-section-alt/80 border border-card-border/60 hover:border-accent/40 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-pink-500/15 text-pink-900 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Qué Incluye el Taller */}
            <div className="pt-3 border-t border-pink-400/15 space-y-6">
              <div className="border-b border-card-border pb-4">
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  ¿Qué Incluye tu Inscripción?
                </h2>
                <p className="text-xs sm:text-sm text-muted font-medium mt-1 max-w-sm">
                  No tendrás que preocuparte por insumos ni gastos ocultos. Llegarás con tus ganas de aprender y disfrutarás de una jornada completa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {workshop.incluye.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-pink-500/5 dark:bg-pink-950/20 border border-pink-500/20 text-xs sm:text-sm font-semibold text-foreground"
                  >
                    <CheckCircle2 size={16} className="text-pink-900 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Requirements Banner */}
            <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 text-foreground space-y-3">
              <div className="flex items-center gap-2.5 text-amber-700 dark:text-amber-400 font-bold text-sm tracking-wider">
                <AlertCircle size={18} /> Requisito Importante para el Participante
              </div>
              <p className="text-sm sm:text-base font-medium text-muted leading-relaxed max-w-md">
                {workshop.studentRequirements}
              </p>
            </div>

            {/* Embedded Workshop Logistics & Conditions */}
            <div className="pt-2">
              <WorkshopConditions
                workshopTitle={workshop.shortTitle}
                location="Caracas, Las Mercedes — Sede Ana's Pastry Shop"
                workshopDate={workshop.schedule}
                workshopTime={workshop.duration}
                price={workshop.price}
                isDecorationWorkshop={workshop.isDecorationWorkshop}
                showCta={false}
              />
            </div>
          </div>

          {/* Right Column: Sticky Reservation Card */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 bg-card border-2 border-accent/40 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">
                  Reserva tu Puesto
                </h3>
                <p className="text-xs text-muted font-medium mt-1">
                  Congela tu asistencia de forma formal. Los cupos se asignan por estricto orden de pago comprobado.
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-card-border/80 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-muted">Inversión Total:</span>
                  <span className="text-2xl font-black text-foreground font-display font-mono">${workshop.price} USD</span>
                </div>
                <div className="border-t border-card-border/60 pt-2.5 space-y-2 text-xs font-semibold">
                  <div className="flex justify-between text-pink-900 dark:text-pink-400 font-bold">
                    <span>50% para Reservar:</span>
                    <span className="font-mono">${depositAmount} USD</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>50% restante al ingresar:</span>
                    <span className="font-mono">${balanceAmount} USD</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  href={`/pagar/curso/${courseId}`}
                  className="w-full bg-accent-solid hover:bg-accent-solid-hover text-white py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg shadow-accent-solid/30 hover:shadow-accent-solid/50 transition"
                >
                  Reservar Cupo Formal (${depositAmount} USD) <ArrowRight size={15} />
                </Link>

                <AddToBagButton
                  item={{
                    id: workshop.legacySlug ?? workshop.id,
                    title: workshop.shortTitle,
                    price: workshop.price,
                    image: workshop.image ?? null,
                    isWorkshop: true,
                  }}
                  variant="solid"
                />

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-[#0B3D2E] py-3 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-md transition"
                >
                  <MessageCircle size={16} /> Consultar Fechas por WhatsApp
                </a>
              </div>

              {/* Checklist */}
              <ul className="space-y-2.5 text-xs text-muted font-medium pt-2 border-t border-card-border">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  <span>Jornada intensiva 100% práctica</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  <span>Todos los ingredientes e insumos incluidos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  <span>Almuerzo completo y refrigerios</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  <span>Recetario impreso y certificado firmado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                  <span>Te llevas tu proyecto / porciones a casa</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-red-500/20 text-[11px] text-red-700 dark:text-red-400 font-medium leading-relaxed">
                <strong>Política de cancelación:</strong> Los cupos son intransferibles y no reembolsables debido a la preparación de insumos frescos por alumno.
              </div>
            </div>
          </aside>
        </div>
      </section>
  );
}
