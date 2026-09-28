import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, MapPin, Sparkles } from "lucide-react";

export function WorkshopDetailHero({
  workshop,
  depositAmount,
}: {
  workshop: {
    shortTitle: string;
    subtitle: string;
    price: number;
    spots: number;
    level: string;
    duration: string;
    startTime: string;
  };
  depositAmount: number;
}) {
  return (
      <section className="relative flex flex-col justify-center pb-10 xl:pt-36 xl:pb-28 bg-gradient-to-b from-brand-purple via-brand-purple-mid to-brand-purple-deep text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#E82D8A_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 items-center">
            {/* Left Info */}
            <div className="xl:col-span-7 space-y-5">
              <div className="relative pt-24 pb-24 flex flex-col justify-center gap-4 xl:block xl:min-h-0 xl:p-0 xl:space-y-5">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-white/60 mb-1 xl:mb-6 font-medium">
                  <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
                  <span>/</span>
                  <Link href="/workshops" className="hover:text-white transition-colors">Workshops Presenciales</Link>
                  <span>/</span>
                  <span className="text-white truncate max-w-xs">{workshop.shortTitle}</span>
                </div>

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

                <h1 className="text-2xl sm:text-4xl xl:text-5xl font-black font-display tracking-tight text-white leading-tight">
                  {workshop.shortTitle}
                </h1>

                <p className="text-sm sm:text-lg text-white/80 font-medium leading-relaxed max-w-lg">
                  {workshop.subtitle}
                </p>

                
              </div>
              <div id="workshop-details" className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm font-semibold text-white/90">
                <div className="bg-brand-purple-deep/90 p-3 rounded-2xl border border-white/15 flex items-center gap-2.5">
                  <Clock size={18} className="text-pink-300 shrink-0" />
                  <div>
                    <p className="text-[11px] text-white/85 uppercase">Duración</p>
                    <p className="font-bold truncate">{workshop.duration.split("(")[0].trim()}</p>
                  </div>
                </div>

                <div className="bg-brand-purple-deep/90 p-3 rounded-2xl border border-white/15 flex items-center gap-2.5">
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
            <div className="xl:col-span-5">
              <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl group bg-[#120317] flex items-center justify-center">
                <div className="relative w-40 sm:w-44 h-14 sm:h-16">
                  <Image
                    src="/logo-anas-pastry-shop-white.png"
                    alt="Ana's Pastry Shop"
                    fill
                    sizes="(max-width: 768px) 160px, 200px"
                    className="object-contain"
                  />
                </div>
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
  );
}
