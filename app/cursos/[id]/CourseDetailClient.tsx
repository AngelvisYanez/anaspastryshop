"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { PlayCircle, Clock, Globe, ChevronDown, ArrowRight, Zap, ChevronRight, HelpCircle, LockIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import CheckoutModal from "@/components/CheckoutModal";

function getEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/watch?v=')) return url.replace('watch?v=', 'embed/');
  if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
  if (url.includes('vimeo.com/')) return url.replace('vimeo.com/', 'player.vimeo.com/video/');
  return url;
}

const FAQS = [
  { q: "¿Es obligatorio registrarse?", a: "Sí. Para garantizar la seguridad de tus pagos y el acceso permanente a tus clases, debes crear una cuenta gratuita antes de realizar cualquier inscripción." },
  { q: "¿Cómo recibo el acceso?", a: "Una vez verificado tu pago (Zelle, USDT o BCV), el curso se desbloqueará automáticamente en tu panel de alumno." },
  { q: "¿Puedo pagar en Bolívares?", a: "Sí. Al completar tu registro e iniciar el proceso de inscripción, selecciona Pago Móvil. El sistema calculará el monto a tasa BCV." },
];

export default function CourseDetailClient({ course, hasPaid }: { course: any, hasPaid: boolean }) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);
  
  const embedUrl = getEmbedUrl(course.introVideo);

  return (
    <main className="min-h-screen bg-[#F8F4EE] pt-28 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6">
        {/* --- BREADCRUMBS --- */}
        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-8">
          <Link href="/cursos" className="hover:text-[#C9A84C] transition-colors">Cursos</Link>
          <ChevronRight size={12} />
          <span className="text-[#0B1F3A]">{course.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* --- COLUMNA IZQUIERDA (CONTENIDO) --- */}
          <div className="lg:col-span-8">
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              
              {course.isLive && (
                 <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block mr-3 shadow-sm border border-orange-200">
                    🔴 EVENTO EN VIVO
                 </span>
              )}
              <span className="bg-amber-100 text-[#C9A84C] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 inline-block shadow-sm">
                NUEVO
              </span>
              
              <h1 className="text-4xl md:text-7xl font-black text-[#0B1F3A] mb-6 leading-[0.9] tracking-tighter">
                {course.title}
              </h1>
              <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl whitespace-pre-wrap">
                {course.description}
              </p>

              {/* Stats Rápidas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 text-center shadow-sm">
                  <Clock className="mx-auto mb-2 text-gray-300" size={20} />
                  <span className="block text-sm font-bold text-[#0B1F3A]">{course.totalHours} horas</span>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 text-center shadow-sm">
                  <PlayCircle className="mx-auto mb-2 text-gray-300" size={20} />
                  <span className="block text-sm font-bold text-[#0B1F3A]">{course.totalClasses} tareas</span>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 text-center shadow-sm">
                  <Globe className="mx-auto mb-2 text-gray-300" size={20} />
                  <span className="block text-sm font-bold text-[#0B1F3A]">{course.language}</span>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 text-center shadow-sm">
                  <Zap className="mx-auto mb-2 text-gray-300" size={20} />
                  <span className="block text-sm font-bold text-[#0B1F3A]">{course.level}</span>
                </div>
              </div>

              {/* Temario (Curriculum) */}
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-3 tracking-tight">
                Contenido del curso
              </h2>

              <div className="space-y-4 mb-20">
                {course.courseModules.map((module: any, idx: number) => (
                  <div key={module.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden group shadow-sm transition-all">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
                      className="w-full p-8 flex justify-between items-center hover:bg-gray-50 transition-colors text-left"
                    >
                      <div>
                        <span className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest block mb-1">
                          Módulo 0{idx + 1}
                        </span>
                        <span className="text-xl font-bold text-[#0B1F3A] group-hover:text-[#C9A84C] transition-colors">
                          {module.title}
                        </span>
                        {/* Vista previa de tareas cuando está cerrado */}
                        {openAccordion !== idx && module.lessons.length > 0 && (
                          <div className="mt-4 space-y-3">
                            {module.lessons.map((lesson: any) => (
                              <div key={lesson.id} className="flex items-start gap-3 text-sm text-gray-500">
                                <div className="w-2 h-2 rounded-full bg-indigo-200 mt-1.5 shrink-0" />
                                <span>
                                  <span className="font-semibold text-gray-600">{lesson.title}</span>
                                  {lesson.summary && (
                                    <span className="text-gray-400">: {lesson.summary.split('\n')[0]}</span>
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronDown className={`text-gray-300 transition-transform shrink-0 ml-4 ${openAccordion === idx ? 'rotate-180' : ''}`} />
                    </button>

                    {openAccordion === idx && (
                      <div className="border-t border-gray-50">
                        {/* Acceso al Módulo (Si tiene video) */}
                        {hasPaid && module.videoUrl ? (
                          <div className="px-8 pt-6">
                            <Link 
                              href={`/clases/${encodeURIComponent(course.title)}/${encodeURIComponent(module.title)}`}
                              className="w-full bg-amber-50 hover:bg-amber-100 border border-indigo-200 text-indigo-700 font-bold py-4 px-6 rounded-2xl flex items-center justify-between transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-indigo-300">
                                  <PlayCircle size={20} className="ml-1" />
                                </div>
                                <div className="text-left">
                                  <span className="block text-sm">Entrar al Aula</span>
                                  <span className="block text-xs text-amber-400 font-normal group-hover:text-indigo-500">Reproducir clase maestra</span>
                                </div>
                              </div>
                              <ArrowRight size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
                            </Link>
                          </div>
                        ) : !hasPaid && module.videoUrl ? (
                          <div className="mx-8 mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                            <LockIcon size={16} className="text-[#C9A84C] shrink-0" />
                            <p className="text-sm font-bold text-[#C9A84C]">Inscríbete para ver el video de este módulo.</p>
                          </div>
                        ) : null}

                        {/* Tareas del módulo */}
                        <div className="px-8 pb-8 pt-6 space-y-3">
                          {module.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                              <div className="w-2 h-2 rounded-full bg-indigo-300 mt-2.5 shrink-0" />
                              <div className="flex-1">
                                <div className="text-sm leading-relaxed text-[#0B1F3A]">
                                  <span className="font-bold">{lesson.title}</span>
                                  {lesson.summary && (
                                    <span className="text-gray-500 ml-1 whitespace-pre-wrap">
                                      {lesson.summary.trim().startsWith(':') ? '' : ': '}
                                      {lesson.summary}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          {module.lessons.length === 0 && (
                            <p className="text-sm text-gray-400 italic">Este módulo no tiene tareas aún.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {course.courseModules.length === 0 && (
                   <div className="text-center p-12 bg-white rounded-[2rem] border border-gray-100 text-gray-400">
                     No hay contenido publicado en este curso todavía.
                   </div>
                )}
              </div>

              {/* --- FAQ SECTION --- */}
              <div className="bg-amber-50/50 rounded-[3rem] p-10 md:p-14 border border-amber-200/50 mb-10 pb-10">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                  <HelpCircle className="text-[#C9A84C]" /> Preguntas Frecuentes
                </h3>
                <div className="space-y-8">
                  {FAQS.map((faq, index) => (
                    <div key={faq.q} className="space-y-2">
                      <h4 className="font-bold text-[#0B1F3A]">{faq.q}</h4>
                      <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </m.div>
          </div>

          {/* --- COLUMNA DERECHA (STICKY CTA) --- */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              <div className="bg-white rounded-[3rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="mb-4 rounded-[2rem] overflow-hidden relative h-56 bg-[#0B1F3A] shadow-[inset_0_-10px_30px_rgba(0,0,0,0.5)] group flex items-center justify-center border border-gray-100">
                     {embedUrl && embedUrl.includes('http') ? (
                        <iframe 
                           src={embedUrl}
                           title="Course Intro"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                           className="absolute inset-0 w-full h-full border-0"
                        />
                     ) : (
                        <div className="text-white text-center p-4 flex flex-col items-center">
                          <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 shadow-xl">
                            <PlayCircle className="text-white opacity-80" size={32} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 opacity-80">Tráiler no configurado</span>
                        </div>
                     )}
                  </div>

                  <div className="text-center mb-8 border-b border-gray-50 pb-6">
                    <p className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest bg-amber-50 inline-block px-3 py-1.5 rounded-full">
                      ¿De qué trata este curso?
                    </p>
                  </div>

                  <div className="flex items-end gap-2 mb-8">
                    <span className="text-6xl font-black text-[#0B1F3A] tracking-tighter">${course.price}</span>
                    <span className="text-gray-400 font-bold mb-3 uppercase text-[10px] tracking-widest">Pago único</span>
                  </div>

                  {hasPaid ? (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 p-6 rounded-3xl mb-8 flex items-center gap-4">
                      <div className="bg-emerald-100 flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-sm">
                        <PlayCircle size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">Acceso Concedido</p>
                        <p className="text-xs font-medium opacity-80 mt-0.5">Disfrutas de este curso por compra individual o membresía activa.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Mensaje Informativo de Plan */}
                      <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl mb-2">
                        <p className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest mb-1">Nivel del Curso: {course.level}</p>
                        <p className="text-[11px] text-gray-500 font-medium">
                          Incluído en el <span className="text-[#0B1F3A] font-black">Plan {
                            course.level === "Principiante" ? "Esencial" : 
                            course.level === "Intermedio" ? "Profesional" : "Elite"
                          }</span> o superior.
                        </p>
                      </div>

                      <button
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full bg-[#0B1F3A] text-white py-6 rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-[#C9A84C] transition-all shadow-xl shadow-amber-100 uppercase tracking-widest text-xs"
                      >
                        Comprar Curso Individual <ArrowRight size={18} />
                      </button>

                      <div className="relative py-2 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                        <span className="relative px-4 bg-white text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">O TAMBIÉN</span>
                      </div>

                      <Link
                        href="/planes"
                        className="w-full bg-white text-[#C9A84C] py-5 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 border-2 border-indigo-50 hover:border-[#C9A84C]/20 hover:bg-amber-50/30 transition-all uppercase tracking-widest text-[10px]"
                      >
                        <Zap size={14} className="fill-current" /> Suscribirme a un Plan
                      </Link>
                    </div>
                  )}

                  {!hasPaid && (
                     <div className="space-y-5 pt-8 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] text-center">Métodos de Pago Soportados</p>
                        <div className="flex justify-center gap-3">
                           {["Zelle", "USDT", "BCV"].map(m => (
                              <span key={m} className="text-[10px] font-bold border border-gray-100 px-4 py-2 rounded-xl text-gray-400 bg-gray-50">{m}</span>
                           ))}
                        </div>
                     </div>
                  )}
                </div>
              </div>

              {/* Card de Instructor */}
              <div className="bg-[#0B1F3A] rounded-[2.5rem] p-8 text-white flex items-center gap-5 border border-white/5 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex-shrink-0 flex items-center justify-center font-bold text-2xl shadow-[0_10px_20px_rgba(90,79,207,0.3)] overflow-hidden">
                  {course.instructor.image ? (
                    <Image src={course.instructor.image} alt={course.instructor.name} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    course.instructor.name ? course.instructor.name.charAt(0).toUpperCase() : 'M'
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Tutor Guía</p>
                  <p className="text-xl font-bold tracking-tight">{course.instructor.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        price={course.price} 
        title={course.title}
        cursoId={course.id}
      />
      <Footer />
    </main>
  );
}
