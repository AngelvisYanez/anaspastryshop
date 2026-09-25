"use client";

import { useState } from "react";
import { m } from "framer-motion";
import {
  PlayCircle, ChevronDown, ArrowRight, CheckCircle, ChevronRight,
  LockIcon, MapPin, Calendar, Clock, Sparkles, BookOpen, AlertTriangle, ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import WorkshopConditions from "@/components/WorkshopConditions";
import AddToBagButton from "@/components/cart/AddToBagButton";
import ScrollIndicator from "@/components/ScrollIndicator";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { WorkshopDetails } from "@/lib/utils/workshop";

function getEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/watch?v=")) return url.replace("watch?v=", "embed/");
  if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
  if (url.includes("vimeo.com/")) return url.replace("vimeo.com/", "player.vimeo.com/video/");
  return url;
}

const FAQS = [
  {
    q: "¿Cómo se formaliza la reserva?",
    a: "Para workshops presenciales, reservas formalmente con el 50% del valor del taller. El 50% restante se cancela el mismo día al ingresar al aula. Para cursos online, el acceso se activa de forma inmediata tras validar el comprobante.",
  },
  {
    q: "¿Qué sucede si no puedo asistir al workshop?",
    a: "Debido a que los insumos frescos y la logística se preparan individualmente para cada alumno, los pagos de reserva no son reembolsables bajo ninguna excepción.",
  },
  {
    q: "¿Necesito experiencia previa?",
    a: "No. Todos nuestros workshops y cursos están diseñados desde cero para que aprendas técnicas, métodos y recetas paso a paso con total soltura.",
  },
  {
    q: "¿Cuáles son los métodos de pago aceptados?",
    a: "Aceptamos Pago Móvil en Bolívares a tasa oficial BCV, Zelle con código QR, Binance Pay en USDT y efectivo en divisas.",
  },
];

export default function CourseDetailClient({
  course,
  hasPaid,
  workshopInfo,
  children,
}: {
  course: any;
  hasPaid: boolean;
  workshopInfo?: WorkshopDetails;
  children?: ReactNode;
}) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const embedUrl = getEmbedUrl(course.introVideo);
  const isWorkshop = workshopInfo?.isWorkshop ?? (course.isLive || /workshop|taller|presencial/i.test(course.title));
  const isDecoration = /decoraci|alisad|torta|pastel/i.test(course.title);
  const reservationFee = Math.round(course.price * 0.5);
  const remainderFee = course.price - reservationFee;

  return (
    <main className="min-h-screen bg-[#FAF6F0]">
      <Navbar />

      <section className="bg-gradient-to-b from-brand-purple via-brand-purple-mid to-brand-purple-deep pt-32 pb-28 relative overflow-hidden text-white min-h-screen flex flex-col justify-center">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/30 to-transparent" />

        <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 relative z-10">
          <nav className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/50 mb-10">
            <Link href="/cursos" className="hover:text-pink-300 transition-colors">
              Workshops & Cursos
            </Link>
            <ChevronRight size={10} />
            <span className="text-white/80 truncate max-w-xs">{course.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7">
              <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex flex-wrap items-center gap-2.5 mb-7">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
                    isWorkshop
                      ? "bg-pink-500/20 border border-pink-400/40 text-pink-200"
                      : "bg-purple-500/20 border border-purple-400/30 text-purple-200"
                  }`}>
                    {isWorkshop ? "Workshop Presencial (8 Horas)" : "Curso Online en Video"}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-white/80 bg-white/10 border border-white/20 px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-widest text-pink-300 bg-pink-500/10 border border-pink-400/20 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-5 leading-[0.98] tracking-tight">
                  {course.title}
                </h1>
                <p className="text-base sm:text-lg text-white/90 mb-8 leading-relaxed max-w-md font-normal">
                  {course.description}
                </p>

                {/* Workshop Logistics Box */}
                {isWorkshop && (
                  <div className="bg-white/10 border border-pink-500/30 rounded-2xl p-5 mb-8 backdrop-blur-md max-w-xl">
                    <div className="flex items-center gap-2 text-pink-300 text-xs font-black uppercase tracking-wider mb-3">
                      <Sparkles size={14} /> Logística del Taller Presencial
                    </div>
                    <div className="space-y-2.5 text-xs text-white">
                      <div className="flex items-start gap-2.5">
                        <MapPin size={16} className="text-pink-300 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block text-white/95">Sede confirmada:</span>
                          <span className="text-white/75">{workshopInfo?.location || "Caracas, Las Mercedes — Sede Ana's Pastry Shop"}</span>
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
              </m.div>
            </div>

            <div className="lg:col-span-5">
              <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <div className="bg-white/[0.06] border border-white/15 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                  <div className="relative h-56 bg-[#120317] flex items-center justify-center overflow-hidden">
                    {embedUrl && embedUrl.includes("http") ? (
                      <iframe
                        src={embedUrl}
                        title="Vista previa"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0"
                      />
                    ) : (
                      <div className="relative w-40 sm:w-44 h-14 sm:h-16">
                        <Image
                          src="/logo-anas-pastry-shop-white.png"
                          alt="Ana's Pastry Shop"
                          fill
                          sizes="(max-width: 768px) 160px, 200px"
                          className="object-contain"
                        />
                      </div>
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
                            <p className="text-sm font-black text-emerald-400 uppercase tracking-tight">Cupo Confirmado</p>
                            <p className="text-xs text-emerald-300/80 mt-0.5">Estás formalmente inscrito en este workshop.</p>
                          </div>
                        </div>

                        <Link
                          href={`/dashboard/cursos/${course.id}`}
                          className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all shadow-md"
                        >
                          Ver Detalles en tu Dashboard <ArrowRight size={14} />
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
                          className="w-full bg-accent text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2.5 hover:bg-accent-hover transition-all text-xs uppercase tracking-widest shadow-xl shadow-pink-600/30"
                        >
                          {isWorkshop ? "Reservar Mi Cupo al Workshop" : "Comprar Curso Online"} <ArrowRight size={14} />
                        </Link>

                        <AddToBagButton
                          item={{
                            id: course.id,
                            title: course.title,
                            price: course.price,
                            image: course.image ?? null,
                            isWorkshop,
                          }}
                          variant="solid"
                        />

                        <div className="pt-3 border-t border-white/15 space-y-1 text-xs font-bold">
                          <p className="text-white">💳 Medios de pago aceptados:</p>
                          <p className="text-white/90 font-medium">Pago Móvil BCV · Zelle QR · Binance Pay · Efectivo</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </m.div>
            </div>
          </div>
        </div>
        <ScrollIndicator />
      </section>

      {/* Main Content Section */}
      <section className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 md:px-10 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-4 bg-accent rounded-full" />
                <p className="text-[11px] font-black uppercase tracking-widest text-accent">
                  {isWorkshop ? "Programa del Taller" : "Módulos & Lecciones"}
                </p>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-8">
                Contenido del Programa ({course.courseModules.length} módulos prácticos)
              </h2>

              <div className="space-y-3 mb-16">
                {course.courseModules.map((module: any, idx: number) => (
                  <div
                    key={module.id}
                    className="bg-card border border-card-border rounded-2xl overflow-hidden transition-all shadow-sm hover:shadow-md hover:border-accent/40"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                      className="w-full px-6 py-5 flex justify-between items-center text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-black text-accent uppercase tracking-widest block mb-1">
                          Módulo {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-base font-bold text-foreground group-hover:text-accent transition-colors leading-tight">
                          {module.title}
                        </span>
                        {openAccordion !== idx && module.lessons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {module.lessons.slice(0, 3).map((lesson: any) => (
                              <span key={lesson.id} className="text-[11px] bg-section-alt text-muted px-2 py-0.5 rounded-md font-medium">
                                {lesson.title}
                              </span>
                            ))}
                            {module.lessons.length > 3 && (
                              <span className="text-[11px] text-muted font-medium self-center">
                                +{module.lessons.length - 3} más
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronDown
                        size={18}
                        className={`ml-4 shrink-0 transition-all ${
                          openAccordion === idx ? "rotate-180 text-accent" : "text-muted"
                        }`}
                      />
                    </button>

                    {openAccordion === idx && (
                      <div className="border-t border-card-border">
                        {hasPaid ? (
                          <div className="px-6 py-4 border-b border-card-border">
                            <Link
                              href={`/dashboard/cursos/${course.id}`}
                              className="w-full bg-accent text-white font-black py-3 px-5 rounded-xl flex items-center justify-between hover:bg-accent-hover transition-all text-xs uppercase tracking-widest shadow-md"
                            >
                              <div className="flex items-center gap-2">
                                <PlayCircle size={16} />
                                <span>Ver detalles en tu panel</span>
                              </div>
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5 px-6 py-3 border-b border-card-border">
                            <LockIcon size={14} className="text-accent shrink-0" />
                            <p className="text-xs font-semibold text-foreground">
                              Reserva tu cupo para desbloquear el material completo de este módulo.
                            </p>
                          </div>
                        )}

                        <div className="px-6 pb-5 pt-3 space-y-2">
                          {module.lessons.map((lesson: any, lIdx: number) => (
                            <div key={lesson.id} className="flex items-start gap-3 py-3 px-2 border-b border-card-border last:border-b-0">
                              <span className="text-xs font-bold text-accent mt-0.5">{lIdx + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-bold text-foreground">{lesson.title}</span>
                                {lesson.summary && (
                                  <p className="text-xs text-muted mt-0.5 leading-relaxed max-w-sm">{lesson.summary}</p>
                                )}
                              </div>
                            </div>
                          ))}
                          {module.lessons.length === 0 && (
                            <p className="text-xs text-muted italic px-1 py-2">Sin lecciones desglosadas en este módulo.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {course.courseModules.length === 0 && (
                  <div className="text-center p-14 bg-card rounded-2xl border border-card-border text-muted shadow-sm">
                    El contenido detallado de este programa estará disponible próximamente.
                  </div>
                )}
              </div>

              {/* Conditions Component exclusively for in-person workshops */}
              {isWorkshop && (
                <div className="mb-16">
                  <WorkshopConditions
                    workshopTitle={course.title}
                    location={workshopInfo?.location}
                    workshopDate={workshopInfo?.workshopDate}
                    workshopTime={workshopInfo?.workshopTime}
                    price={course.price}
                    isDecorationWorkshop={isDecoration}
                    showCta={!hasPaid}
                  />
                </div>
              )}

              {/* FAQs */}
              <div>
                <h3 className="text-2xl font-black text-foreground mb-6">Preguntas Frecuentes</h3>
                <div className="space-y-4">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
                      <h4 className="font-bold text-sm text-foreground mb-2">{faq.q}</h4>
                      <p className="text-sm text-muted leading-relaxed font-medium max-w-md">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </m.div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card border border-card-border rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-black text-xs uppercase tracking-wider text-muted">
                Ficha del Programa
              </h3>
              <div className="space-y-3 text-xs divide-y divide-card-border">
                <div className="flex justify-between py-2">
                  <span className="text-muted">Modalidad</span>
                  <span className="font-bold text-foreground">{isWorkshop ? "Workshop Presencial" : "Curso Online"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted">Duración</span>
                  <span className="font-bold text-foreground">{course.totalHours} horas</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted">Módulos</span>
                  <span className="font-bold text-foreground">{course.courseModules.length} módulos</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted">Insumos & Guía</span>
                  <span className="font-bold text-emerald-600">Incluidos</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted">Instructora</span>
                  <span className="font-bold text-foreground">{course.instructor?.name || "Anais Flores"}</span>
                </div>
              </div>
            </div>

            {isWorkshop && (
              <div className="bg-card border border-card-border rounded-3xl p-6 shadow-sm space-y-3 text-xs">
                <h4 className="font-black text-xs uppercase tracking-wider text-accent flex items-center gap-1.5">
                  <ShieldCheck size={16} /> Resumen de Logística
                </h4>
                <div className="space-y-2 text-muted">
                  <p>• <strong>Horario:</strong> 9:00 AM puntual a 5:00 PM (8 horas).</p>
                  <p>• <strong>Reserva:</strong> 50% ($${reservationFee} USD) + 50% al ingresar.</p>
                  <p>• <strong>Herramienta:</strong> {isDecoration ? "Traer base giratoria (bailarina)." : "Todas las herramientas suministradas."}</p>
                  <p>• <strong>Cancelación:</strong> No reembolsable sin excepción.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {children}
    </main>
  );
}
