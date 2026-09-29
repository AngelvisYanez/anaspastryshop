"use client";

import { m } from "framer-motion";
import {
  ArrowRight, CheckCircle, ChevronRight,
  MapPin, Calendar, Clock, Sparkles, CreditCard,
} from "lucide-react";
import AddToBagButton from "@/components/cart/AddToBagButton";
import ScrollIndicator from "@/components/ScrollIndicator";
import Link from "next/link";
import Image from "next/image";
import { WORKSHOP_LOCATION, type WorkshopDetails } from "@/lib/utils/workshop";
import { getCourseEmbedUrl } from "./courseEmbed";
import { resolveCourseCover } from "@/lib/data/onlineCourseCovers";
import CourseCoverPlaceholder from "@/components/CourseCoverPlaceholder";

export function CourseDetailHero({
  course,
  hasPaid,
  workshopInfo,
  isWorkshop,
  reservationFee,
  remainderFee,
  paymentMethods = [],
}: {
  course: any;
  hasPaid: boolean;
  workshopInfo?: WorkshopDetails;
  isWorkshop: boolean;
  reservationFee: number;
  remainderFee: number;
  paymentMethods?: string[];
}) {
  const embedUrl = getCourseEmbedUrl(course.introVideo);
  const coverSrc = resolveCourseCover({
    title: course.title,
    slug: course.slug,
    image: course.image,
    isWorkshop,
  });

  return (
    <section className="relative flex flex-col justify-center pb-10 xl:pt-36 xl:pb-28 bg-gradient-to-b from-brand-purple via-brand-purple-mid to-brand-purple-deep text-white overflow-hidden min-h-[100svh] xl:min-h-0">
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#E82D8A_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />

      <div className="page-container relative z-10 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-12 items-center">
          <div className="xl:col-span-7 space-y-5">
            <div className="relative pt-24 pb-8 flex flex-col justify-center gap-4 xl:block xl:min-h-0 xl:p-0 xl:space-y-5">
              <nav className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/50 mb-1 xl:mb-6">
                <Link href="/cursos" className="hover:text-pink-300 transition-colors">
                  Workshops & Cursos
                </Link>
                <ChevronRight size={10} />
                <span className="text-white/80 truncate max-w-xs">{course.title}</span>
              </nav>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
                  isWorkshop
                    ? "bg-pink-500/20 border border-pink-400/40 text-pink-200"
                    : "bg-purple-500/20 border border-purple-400/30 text-purple-200"
                }`}>
                  {isWorkshop ? "Workshop Presencial (8 Horas)" : "Curso Online"}
                </span>
                {isWorkshop && course.category && (
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/80 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span className="text-[11px] font-black uppercase tracking-widest text-pink-300 bg-pink-500/10 border border-pink-400/20 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                )}
              </div>

              <m.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl sm:text-4xl xl:text-5xl font-black font-display tracking-tight text-white leading-tight"
              >
                {course.title}
              </m.h1>

              <p className="text-sm sm:text-lg text-white/80 font-medium leading-relaxed max-w-lg">
                {course.description}
              </p>

              {isWorkshop && (
                <div className="bg-white/10 border border-pink-500/30 rounded-2xl p-5 backdrop-blur-md max-w-xl">
                  <div className="flex items-center gap-2 text-pink-300 text-xs font-black uppercase tracking-wider mb-3">
                    <Sparkles size={14} /> Logística del Taller Presencial
                  </div>
                  <div className="space-y-2.5 text-xs text-white">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={16} className="text-pink-300 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-white/95">Sede confirmada:</span>
                        <span className="text-white/75">{workshopInfo?.location || WORKSHOP_LOCATION}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/15 text-[11px]">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-pink-300 shrink-0" />
                        <span><strong>Fecha:</strong> {workshopInfo?.workshopDate || "Próximamente"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-pink-300 shrink-0" />
                        <span><strong>Horario:</strong> {workshopInfo?.workshopTime || "09:00 AM — 05:00 PM"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-5 w-full max-w-md mx-auto xl:max-w-none xl:mx-0">
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/[0.06] border border-white/15 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl"
            >
              <div className="relative w-full aspect-square bg-[#120317] overflow-hidden">
                {embedUrl && embedUrl.includes("http") ? (
                  <iframe
                    src={embedUrl}
                    title="Vista previa"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full border-0"
                  />
                ) : coverSrc ? (
                  <Image
                    src={coverSrc}
                    alt={course.title}
                    fill
                    priority
                    sizes="(max-width: 1280px) 92vw, 520px"
                    className="object-cover"
                  />
                ) : (
                  <CourseCoverPlaceholder
                    title={course.title}
                    category={course.category}
                    isWorkshop={isWorkshop}
                    forceWhite
                    className="border-0 bg-transparent"
                  />
                )}
              </div>

              <div className="p-6 space-y-4">
                {hasPaid ? (
                  <div className="space-y-3">
                    <div className="pt-3 border-t border-emerald-500/25 flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-emerald-400 uppercase tracking-tight">
                          {isWorkshop ? "Cupo Confirmado" : "Acceso Activo"}
                        </p>
                        <p className="text-xs text-emerald-300/80 mt-0.5">
                          {isWorkshop
                            ? "Estás formalmente inscrito en este workshop."
                            : "Ya tienes acceso permanente a este curso online."}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={isWorkshop ? `/dashboard/cursos/${course.id}` : `/cursos/${course.slug ?? course.id}`}
                      className="w-full bg-accent-solid hover:bg-accent-solid-hover text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition shadow-md"
                    >
                      {isWorkshop ? "Ver Detalles en tu Dashboard" : "Entrar al Curso"} <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between px-1">
                      <span className="text-xs text-white/70 font-bold uppercase tracking-widest">
                        {isWorkshop ? "Inversión Total" : "Acceso Permanente"}
                      </span>
                      <span className="text-3xl font-black text-white tracking-tight">
                        ${course.price} <span className="text-xs text-pink-300 font-bold">USD</span>
                      </span>
                    </div>

                    {isWorkshop && (
                      <div className="pt-3 border-t border-white/15 space-y-1.5 text-xs font-medium text-white/90">
                        <p className="flex justify-between">
                          <span className="text-white/70">50% Reserva hoy:</span>
                          <strong className="text-pink-300">${reservationFee} USD</strong>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-white/70">50% Saldo el día del taller:</span>
                          <strong>${remainderFee} USD</strong>
                        </p>
                      </div>
                    )}

                    <Link
                      href={`/pagar/curso/${course.id}`}
                      className="w-full bg-accent-solid text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2.5 hover:bg-accent-solid-hover transition text-xs uppercase tracking-widest shadow-xl shadow-accent-solid/30"
                    >
                      {isWorkshop ? "Reservar Mi Cupo al Workshop" : "Comprar Curso Online"} <ArrowRight size={14} />
                    </Link>

                    <AddToBagButton
                      item={{
                        id: course.id,
                        title: course.title,
                        price: course.price,
                        image: coverSrc,
                        isWorkshop,
                      }}
                      variant="solid"
                    />

                    {paymentMethods.length > 0 && (
                      <div className="pt-3 border-t border-white/15 space-y-1.5 text-xs font-bold">
                        <p className="text-white flex items-center gap-2">
                          <CreditCard size={14} className="text-pink-300 shrink-0" aria-hidden />
                          Medios de pago aceptados:
                        </p>
                        <p className="text-white/90 font-medium">
                          {paymentMethods.join(" · ")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </m.div>
          </div>
        </div>
      </div>
      <ScrollIndicator />
    </section>
  );
}
