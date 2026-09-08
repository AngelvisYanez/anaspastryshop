import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WorkshopConditions from "@/components/WorkshopConditions";
import AddToBagButton from "@/components/cart/AddToBagButton";
import { getWorkshopBySlug, getAllWorkshops } from "@/lib/data/workshops";
import {
  Clock, Calendar, Users, MapPin, Sparkles, CheckCircle2,
  AlertCircle, ArrowRight, MessageCircle, Share2, Award
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const workshops = getAllWorkshops();
  return workshops.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);

  if (!workshop) {
    return {
      title: "Workshop No Encontrado | Ana's Pastry Shop",
    };
  }

  return {
    title: `${workshop.title} — Workshop Presencial | Ana's Pastry Shop`,
    description: `${workshop.subtitle}. Workshop presencial intensivo de 8 horas en Caracas (Las Mercedes). Cupo reducido de ${workshop.spots} personas. Inversión: $${workshop.price} USD.`,
    openGraph: {
      title: `${workshop.title} — Ana's Pastry Shop`,
      description: workshop.subtitle,
      images: [{ url: workshop.image, width: 1200, height: 630, alt: workshop.title }],
    },
  };
}

async function WorkshopDetailContent({ params }: PageProps) {
  const { slug } = await params;
  const workshop = getWorkshopBySlug(slug);

  if (!workshop) {
    notFound();
  }

  // Calculate 50% deposit
  const depositAmount = Math.round(workshop.price * 0.5);
  const balanceAmount = workshop.price - depositAmount;

  // WhatsApp link with pre-filled message
  const waText = encodeURIComponent(
    `¡Hola Chef Anais! Me interesa información e inscripción para el taller presencial: "${workshop.title}" ($${workshop.price} USD). ¿Cuáles son las próximas fechas disponibles?`
  );
  const waUrl = `https://wa.me/584120000000?text=${waText}`;

  // Corresponding online course ID or fallback
  const courseId = (workshop as any).courseId || workshop.legacySlug || workshop.id || `ws-${workshop.slug}`;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 sm:pt-36 sm:pb-20 bg-gradient-to-b from-[#25072F] via-[#350A43] to-[#1C0425] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#E82D8A_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-white/60 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <Link href="/workshops" className="hover:text-white transition-colors">Workshops Presenciales</Link>
            <span>/</span>
            <span className="text-white truncate max-w-xs">{workshop.shortTitle}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Info */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-black uppercase tracking-wider">
                  <Sparkles size={12} /> Workshop Presencial Intensivo
                </span>
                <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-pink-300 text-xs font-bold">
                  Solo {workshop.spots} Cupos
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                  {workshop.level}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-tight">
                {workshop.title}
              </h1>

              <p className="text-base sm:text-lg text-white/80 font-medium leading-relaxed max-w-lg">
                {workshop.subtitle}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm font-semibold text-white/90">
                <div className="bg-[#1C0425]/90 p-3 rounded-2xl border border-white/15 flex items-center gap-2.5">
                  <Clock size={18} className="text-pink-300 shrink-0" />
                  <div>
                    <p className="text-[11px] text-white/85 uppercase">Duración</p>
                    <p className="font-bold truncate">{workshop.duration.split("(")[0].trim()}</p>
                  </div>
                </div>

                <div className="bg-[#1C0425]/90 p-3 rounded-2xl border border-white/15 flex items-center gap-2.5">
                  <Calendar size={18} className="text-pink-300 shrink-0" />
                  <div>
                    <p className="text-[11px] text-white/85 uppercase">Horario</p>
                    <p className="font-bold truncate">{workshop.startTime}</p>
                  </div>
                </div>

                <div className="bg-[#1C0425]/90 p-3 rounded-2xl border border-white/15 flex items-center gap-2.5 col-span-2 sm:col-span-1">
                  <MapPin size={18} className="text-pink-300 shrink-0" />
                  <div>
                    <p className="text-[11px] text-white/85 uppercase">Ubicación</p>
                    <p className="font-bold truncate">Caracas, Las Mercedes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card / Visual */}
            <div className="lg:col-span-5">
              <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl group">
                <Image
                  src={workshop.image}
                  alt={workshop.title}
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[11px] font-black uppercase tracking-widest text-pink-300 block mb-1">
                    Inversión del Taller
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-white font-display">
                      ${workshop.price}
                    </span>
                    <span className="text-xs text-white/70 font-semibold uppercase">USD por participante</span>
                  </div>
                  <p className="text-xs text-pink-300 font-semibold mt-1">
                    Reserva hoy con solo ${depositAmount} USD (50%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
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
                    key={idx}
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
                {workshop.incluye.map((item, idx) => (
                  <div
                    key={idx}
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
                workshopTitle={workshop.title}
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
                  className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 px-5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-lg shadow-pink-600/30 hover:shadow-pink-600/50 transition-all"
                >
                  Reservar Cupo Formal (${depositAmount} USD) <ArrowRight size={15} />
                </Link>

                <AddToBagButton
                  item={{
                    id: workshop.legacySlug ?? workshop.id,
                    title: workshop.title,
                    price: workshop.price,
                    image: workshop.image,
                    isWorkshop: true,
                  }}
                  variant="solid"
                />

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-[#0B3D2E] py-3 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-md transition-all"
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

      {/* Other Workshops Carousel / Grid */}
      <section className="py-16 bg-section-alt border-t border-card-border">
        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                Otros Workshops Presenciales
              </h2>
            </div>
            <Link href="/workshops" className="text-xs font-bold text-pink-900 hover:underline flex items-center gap-1">
              Ver Catálogo Completo <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getAllWorkshops()
              .filter((w) => w.slug !== workshop.slug && w.legacySlug !== workshop.slug)
              .slice(0, 4)
              .map((other) => (
                <Link
                  key={other.slug}
                  href={`/workshop/${other.slug}`}
                  className="group bg-card border border-card-border hover:border-accent/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="relative h-36 bg-muted/20">
                    <Image src={other.image} alt={other.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-pink-200 font-black text-xs px-2 py-0.5 rounded font-mono">
                      ${other.price} USD
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-xs sm:text-sm text-foreground group-hover:text-accent transition-colors line-clamp-2">
                      {other.title}
                    </h3>
                    <span className="text-[11px] font-bold text-pink-900 mt-2 flex items-center gap-1">
                      Ver Taller &rarr;
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function WorkshopDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <WorkshopDetailContent params={params} />
    </Suspense>
  );
}
