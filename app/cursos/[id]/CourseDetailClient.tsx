"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { PlayCircle, ChevronDown, ArrowRight, Zap, ChevronRight, LockIcon, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

function getEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
  if (url.includes('vimeo.com/')) return url.replace('vimeo.com/', 'player.vimeo.com/video/');
  return url;
}

const FAQS = [
  { q: "¿Es obligatorio registrarse?", a: "Sí. Para garantizar el acceso permanente a tus clases, debes crear una cuenta gratuita antes de activar tu membresía." },
  { q: "¿Cómo recibo el acceso?", a: "Una vez activa tu membresía mensual, todos los cursos se desbloquean automáticamente en tu panel de alumno." },
  { q: "¿Qué incluye la membresía?", a: "La membresía mensual da acceso completo a todo el catálogo de cursos disponibles en Academia Omnia." },
];

export default function CourseDetailClient({ course, hasPaid, children }: { course: any; hasPaid: boolean; children?: ReactNode }) {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  const embedUrl = getEmbedUrl(course.introVideo);

  return (
    <main className="min-h-screen bg-[#F8F4EE]">
      <Navbar />

      <section className="bg-[#0B1F3A] pt-28 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(201,168,76,0.10)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(201,168,76,0.05)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/25 mb-10">
            <Link href="/cursos" className="hover:text-[#C9A84C] transition-colors">Cursos</Link>
            <ChevronRight size={10} />
            <span className="text-white/50">{course.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7">
              <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex flex-wrap items-center gap-2.5 mb-7">
                  {course.isLive && (
                    <span className="bg-orange-500/15 border border-orange-500/25 text-orange-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      🔴 EN VIVO
                    </span>
                  )}
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/20 px-3 py-1 rounded-full">
                    {course.category}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                </div>

                <h1 className="text-5xl md:text-[5.5rem] font-black text-white mb-5 leading-[0.88] tracking-tighter">
                  {course.title}
                </h1>
                <p className="text-lg text-white/45 mb-10 leading-relaxed max-w-xl">
                  {course.description}
                </p>

              </m.div>
            </div>

            <div className="lg:col-span-5">
              <m.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="relative h-52 bg-[#060F1E] flex items-center justify-center overflow-hidden">
                    {embedUrl && embedUrl.includes('http') ? (
                      <iframe
                        src={embedUrl}
                        title="Course Intro"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full border-0"
                      />
                    ) : (
                      <div className="text-center flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-full flex items-center justify-center">
                          <PlayCircle className="text-[#C9A84C]" size={28} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Vista previa no disponible</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {hasPaid ? (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle size={16} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-emerald-400 uppercase tracking-tight">Acceso Activo</p>
                          <p className="text-xs text-emerald-400/60 mt-0.5">Tienes acceso completo a este curso.</p>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href="/membresia"
                        className="w-full bg-[#C9A84C] text-[#0B1F3A] py-4 rounded-xl font-black flex items-center justify-center gap-2.5 hover:bg-[#d4b55c] transition-all text-xs uppercase tracking-widest shadow-lg shadow-[#C9A84C]/20"
                      >
                        <Zap size={13} className="fill-current" /> Activar Membresía <ArrowRight size={14} />
                      </Link>
                    )}

                  </div>
                </div>
              </m.div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            <m.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-4 bg-[#C9A84C] rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C]">Contenido</p>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-[#0B1F3A] tracking-tighter mb-10">
                Contenido del curso
              </h2>

              <div className="space-y-2.5 mb-20">
                {course.courseModules.map((module: any, idx: number) => (
                  <div
                    key={module.id}
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-md hover:border-[#C9A84C]/30"
                  >
                    <button
                      onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                      className="w-full px-6 py-5 flex justify-between items-center text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest block mb-1">
                          Módulo {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="text-base font-bold text-[#0B1F3A] group-hover:text-[#C9A84C] transition-colors leading-tight">
                          {module.title}
                        </span>
                        {openAccordion !== idx && module.lessons.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {module.lessons.slice(0, 3).map((lesson: any) => (
                              <span key={lesson.id} className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-md font-medium border border-gray-100">
                                {lesson.title}
                              </span>
                            ))}
                            {module.lessons.length > 3 && (
                              <span className="text-[10px] text-gray-300 font-medium self-center">+{module.lessons.length - 3} más</span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronDown
                        size={16}
                        className={`ml-4 shrink-0 transition-all ${openAccordion === idx ? 'rotate-180 text-[#C9A84C]' : 'text-gray-300'}`}
                      />
                    </button>

                    {openAccordion === idx && (
                      <div className="border-t border-gray-50">
                        {hasPaid && module.videoUrl ? (
                          <div className="p-4">
                            <Link
                              href={`/clases/${encodeURIComponent(course.title)}/${encodeURIComponent(module.title)}`}
                              className="w-full bg-[#0B1F3A] text-white font-black py-3.5 px-5 rounded-xl flex items-center justify-between hover:bg-[#C9A84C] hover:text-[#0B1F3A] transition-all group text-xs uppercase tracking-widest shadow-lg"
                            >
                              <div className="flex items-center gap-2.5">
                                <PlayCircle size={16} />
                                <span>Entrar al Aula</span>
                              </div>
                              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        ) : !hasPaid && module.videoUrl ? (
                          <div className="mx-4 my-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                            <LockIcon size={13} className="text-[#C9A84C] shrink-0" />
                            <p className="text-xs font-bold text-[#C9A84C]">Activa tu membresía para acceder a este módulo.</p>
                          </div>
                        ) : null}

                        <div className="px-6 pb-5 pt-3 space-y-2">
                          {module.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]/60 mt-2 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-bold text-[#0B1F3A]">{lesson.title}</span>
                                {lesson.summary && (
                                  <span className="text-xs text-gray-400 ml-1">
                                    {lesson.summary.trim().startsWith(':') ? '' : ': '}{lesson.summary}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {module.lessons.length === 0 && (
                            <p className="text-xs text-gray-300 italic px-1 py-2">Sin lecciones publicadas aún.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {course.courseModules.length === 0 && (
                  <div className="text-center p-16 bg-white rounded-xl border border-gray-100 text-gray-300 shadow-sm">
                    No hay contenido publicado en este curso todavía.
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-14">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1 h-4 bg-[#C9A84C] rounded-full" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C]">FAQ</p>
                </div>
                <h3 className="text-2xl font-black text-[#0B1F3A] tracking-tighter mb-8">Preguntas Frecuentes</h3>
                <div className="space-y-3">
                  {FAQS.map((faq) => (
                    <div key={faq.q} className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                      <h4 className="font-black text-[#0B1F3A] mb-2 text-sm">{faq.q}</h4>
                      <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </m.div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-3">
              {!hasPaid && (
                <div className="bg-[#0B1F3A] border border-[#C9A84C]/20 rounded-2xl p-6 space-y-5 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/5 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A84C] mb-2">Accede ahora</p>
                    <p className="text-xl font-black text-white tracking-tight leading-tight mb-4">Todo el catálogo por un solo precio.</p>
                    <Link
                      href="/membresia"
                      className="w-full bg-[#C9A84C] text-[#0B1F3A] py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#d4b55c] transition-all text-xs uppercase tracking-widest shadow-xl shadow-[#C9A84C]/20"
                    >
                      <Zap size={13} className="fill-current" /> Ver membresía <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-amber-50 flex items-center justify-center">
                  {course.instructor.image ? (
                    <Image src={course.instructor.image} alt={course.instructor.name} width={48} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-lg text-[#C9A84C]">{course.instructor.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest mb-0.5">Instructor</p>
                  <p className="text-sm font-black text-[#0B1F3A] tracking-tight">{course.instructor.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xl font-black text-[#C9A84C] leading-none mb-1">{course.totalHours}h</p>
                  <p className="text-[9px] text-[#0B1F3A] uppercase tracking-widest font-bold">Duración</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xl font-black text-[#C9A84C] leading-none mb-1">{course.totalClasses}</p>
                  <p className="text-[9px] text-[#0B1F3A] uppercase tracking-widest font-bold">Lecciones</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-xl font-black text-[#C9A84C] leading-none mb-1">{course.courseModules.length}</p>
                  <p className="text-[9px] text-[#0B1F3A] uppercase tracking-widest font-bold">Módulos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {children}
    </main>
  );
}
