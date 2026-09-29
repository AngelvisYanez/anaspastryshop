import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle, PlayCircle, BookOpen, ArrowRight,
  MapPin, Calendar, Clock, Tag,
} from "lucide-react";
import { parseWorkshopDetails } from "@/lib/utils/workshop";

export function UserDashboardHome({
  userCourses,
  pendingInscription,
}: {
  userCourses: any[];
  pendingInscription: boolean;
}) {
  return (

        <div className="space-y-6 sm:space-y-8">
          {/* Promo Card: Bundle de Cursos Online con Cupón */}
          <div className="bg-gradient-to-br from-brand-purple via-brand-purple-deep to-brand-purple-deep border-2 border-accent/30 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-accent/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="inline-flex items-center gap-1.5 bg-accent-solid text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                  <Tag size={12} /> Cupón de Promoción Especial
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Compra todos los Cursos Online con Descuento
                </h2>
                <p className="text-sm text-white/80 leading-relaxed font-medium">
                  Aplica el cupón <strong className="text-pink-300 bg-white/10 px-2 py-0.5 rounded font-mono text-base">TODOSLOSCURSOS</strong> al pagar ambos cursos online y obtén 40% de descuento.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                <Link
                  href="/cursos?tipo=online"
                  className="bg-accent-solid text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-accent-solid-hover transition-colors text-center shadow-lg"
                >
                  Ver Cursos Online
                </Link>
                <Link
                  href="/cursos?tipo=presencial"
                  className="bg-white/10 text-white border border-white/20 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/20 transition-colors text-center"
                >
                  Workshops Presenciales
                </Link>
              </div>
            </div>
          </div>

          {/* Pending Payment Notification */}
          {pendingInscription && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-0.5">
                  Pago en Proceso de Verificación
                </p>
                <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                  Tu comprobante está siendo revisado por nuestro equipo de administración. Recibirás un correo en cuanto se habilite tu acceso al curso o taller.
                </p>
              </div>
            </div>
          )}

          {/* User's Courses and Workshops */}
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-accent mb-0.5">
                  Tus Formaciones Adquiridas
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  Mis Cursos & Workshops Activos
                </h2>
              </div>
              <Link href="/cursos" className="shrink-0">
                <span className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  Explorar Más <ArrowRight size={14} />
                </span>
              </Link>
            </div>

            {userCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {userCourses.map((curso) => {
                  const workshopInfo = parseWorkshopDetails(curso.content, curso.isLive, curso.title);
                  const isWorkshop = workshopInfo.isWorkshop;

                  return (
                    <Link
                      key={curso.id}
                      href={`/dashboard/cursos/${curso.id}`}
                      className="group bg-card border border-card-border hover:border-accent/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                    >
                      <div className="relative w-full aspect-square bg-section-alt overflow-hidden">
                        {curso.image ? (
                          <Image
                            src={curso.image}
                            alt={curso.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-accent-subtle">
                            <PlayCircle size={40} className="text-accent/60" />
                          </div>
                        )}
                        <span className={`absolute top-3 left-3 text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md ${
                          isWorkshop
                            ? "bg-accent-solid text-white"
                            : "bg-purple-900/90 text-pink-200 border border-pink-500/30"
                        }`}>
                          {isWorkshop ? "Workshop Presencial" : "Curso Online"}
                        </span>
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="font-bold text-foreground text-base line-clamp-1 group-hover:text-accent transition-colors">
                            {curso.title}
                          </h3>
                          <p className="text-xs text-muted line-clamp-2 mt-1">
                            {curso.description}
                          </p>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-card-border/60">
                          {isWorkshop ? (
                            <div className="space-y-1 text-xs text-muted font-medium">
                              <p className="flex items-center gap-1.5 text-foreground">
                                <MapPin size={12} className="text-accent shrink-0" />
                                <span className="truncate">{workshopInfo.location}</span>
                              </p>
                              <p className="flex items-center gap-1.5">
                                <Calendar size={12} className="text-accent shrink-0" />
                                <span>{workshopInfo.workshopDate}</span>
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs text-muted">
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="text-accent" />
                                {curso.totalHours}h
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen size={12} className="text-accent" />
                                {curso._count?.courseModules || 0} módulos cargados
                              </span>
                            </div>
                          )}

                          <div className="mt-auto pt-2 border-t border-card-border flex items-center justify-between">
                            <span className="text-xs font-bold text-accent group-hover:underline flex items-center gap-1">
                              {isWorkshop ? "Ver Detalles Presenciales" : "Ver Todos los Módulos"} →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card border border-card-border rounded-2xl p-10 text-center max-w-xl mx-auto shadow-sm">
                <BookOpen size={40} className="mx-auto text-accent/40 mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">
                  Aún no tienes formaciones activas
                </h3>
                <p className="text-xs text-muted font-medium mb-6">
                  Elige entre nuestros cursos online interactivos por módulos o reserva tu cupo para los talleres presenciales.
                </p>
                <Link
                  href="/cursos"
                  className="inline-flex items-center gap-2 bg-accent-solid text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-accent-solid-hover transition-colors shadow-md"
                >
                  Explorar Catálogo
                </Link>
              </div>
            )}
          </div>
        </div>
  );
}
