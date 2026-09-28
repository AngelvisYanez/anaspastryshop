"use client";

import { useState } from "react";
import { m } from "framer-motion";
import {
  PlayCircle, ChevronDown, ArrowRight,
  LockIcon, ShieldCheck,
} from "lucide-react";
import WorkshopConditions from "@/components/WorkshopConditions";
import Link from "next/link";
import type { WorkshopDetails } from "@/lib/utils/workshop";
import { COURSE_FAQS } from "./courseFaqs";

export function CourseDetailBody({
  course,
  hasPaid,
  workshopInfo,
  isWorkshop,
  isDecoration,
  reservationFee,
}: {
  course: any;
  hasPaid: boolean;
  workshopInfo?: WorkshopDetails;
  isWorkshop: boolean;
  isDecoration: boolean;
  reservationFee: number;
}) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  return (
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
                    className="bg-card border border-card-border rounded-2xl overflow-hidden transition shadow-sm hover:shadow-md hover:border-accent/40"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                      aria-expanded={openAccordion === idx}
                      aria-controls={`module-panel-${module.id}`}
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
                        className={`ml-4 shrink-0 transition ${
                          openAccordion === idx ? "rotate-180 text-accent" : "text-muted"
                        }`}
                      />
                    </button>

                    {openAccordion === idx && (
                      <div id={`module-panel-${module.id}`} className="border-t border-card-border">
                        {hasPaid ? (
                          <div className="px-6 py-4 border-b border-card-border">
                            <Link
                              href={`/dashboard/cursos/${course.id}`}
                              className="w-full bg-accent-solid text-white font-black py-3 px-5 rounded-xl flex items-center justify-between hover:bg-accent-solid-hover transition text-xs uppercase tracking-widest shadow-md"
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
                  {COURSE_FAQS.map((faq) => (
                    <div key={faq.q} className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
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
                  <p>• <strong>Reserva:</strong> 50% (${reservationFee} USD) + 50% al ingresar.</p>
                  <p>• <strong>Herramienta:</strong> {isDecoration ? "Traer base giratoria (bailarina)." : "Todas las herramientas suministradas."}</p>
                  <p>• <strong>Cancelación:</strong> No reembolsable sin excepción.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
  );
}
