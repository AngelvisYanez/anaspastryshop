"use client";

import Link from "next/link";
import {
  Sparkles, ChevronDown, GraduationCap, Clock, BookOpen,
} from "lucide-react";
import { WORKSHOPS_DATA } from "@/lib/data/workshops";
import { ONLINE_COURSES_DATA } from "@/lib/data/online-courses";

function NavLinkUnderline({
  href,
  label,
  linkColor,
  active,
}: {
  href: string;
  label: string;
  linkColor: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`font-display text-sm font-semibold transition-colors relative group ${linkColor} ${
        active ? "text-accent font-bold" : ""
      }`}
    >
      {label}
      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition duration-300 group-hover:w-full" />
    </Link>
  );
}

export function NavbarDesktopNav({
  pathname,
  linkColor,
  workshopsOpen,
  coursesOpen,
  onWorkshopsEnter,
  onWorkshopsLeave,
  onCoursesEnter,
  onCoursesLeave,
  onCloseWorkshops,
  onCloseCourses,
  hasSession,
  hasMisCursos,
}: {
  pathname: string;
  linkColor: string;
  workshopsOpen: boolean;
  coursesOpen: boolean;
  onWorkshopsEnter: () => void;
  onWorkshopsLeave: () => void;
  onCoursesEnter: () => void;
  onCoursesLeave: () => void;
  onCloseWorkshops: () => void;
  onCloseCourses: () => void;
  hasSession: boolean;
  hasMisCursos: boolean;
}) {
  const isWorkshopsActive =
    pathname === "/workshops" ||
    pathname.startsWith("/workshops/") ||
    pathname.startsWith("/workshop/");

  const isCursosActive =
    (pathname === "/cursos" || pathname.startsWith("/cursos/")) && !isWorkshopsActive;

  return (
    <nav className="hidden xl:flex items-center gap-4 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
      <NavLinkUnderline href="/" label="Inicio" linkColor={linkColor} active={pathname === "/"} />

      <div
        id="workshops-dropdown-container"
        className="relative"
        onMouseEnter={onWorkshopsEnter}
        onMouseLeave={onWorkshopsLeave}
        onFocus={onWorkshopsEnter}
        onBlur={onWorkshopsLeave}
      >
        <Link
          href="/workshops"
          className={`font-display text-sm font-semibold transition-colors relative group flex items-center gap-1.5 ${linkColor} ${
            isWorkshopsActive ? "text-accent font-bold" : ""
          }`}
        >
          Workshops Presenciales
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              workshopsOpen ? "rotate-180 text-accent" : "opacity-70"
            }`}
          />
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition duration-300 group-hover:w-full" />
        </Link>

        {workshopsOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-card border border-card-border rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between px-3 py-2 border-b border-card-border mb-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                  <Sparkles size={13} /> Workshops Presenciales
                </p>
                <p className="text-[11px] text-muted">Coro, Falcón · Práctica 100% en vivo</p>
              </div>
              <Link
                href="/workshops"
                onClick={onCloseWorkshops}
                className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
              >
                Ver Cartelera &rarr;
              </Link>
            </div>

            <div className="px-3 pb-2">
              <Link
                href="/workshops/calendario"
                onClick={onCloseWorkshops}
                className="flex items-center justify-between w-full rounded-2xl border border-accent/20 bg-accent/5 hover:bg-accent/10 px-3 py-2 transition-colors"
              >
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Clock size={13} className="text-accent" /> Calendario de fechas
                </span>
                <span className="text-[11px] font-bold text-accent">Abrir →</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-[380px] overflow-y-auto pr-1">
              {WORKSHOPS_DATA.map((w) => (
                <Link
                  key={w.slug}
                  href={`/workshop/${w.slug}`}
                  onClick={onCloseWorkshops}
                  className="p-2.5 rounded-2xl hover:bg-card-hover transition-colors group flex flex-col justify-between border border-transparent hover:border-accent/20"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/20 px-2 py-0.5 rounded-md">
                        {w.spots} Cupos
                      </span>
                      <span className="text-[11px] font-black text-foreground font-mono">
                        ${w.price} USD
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {w.shortTitle}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted mt-1 truncate">
                    {w.schedule.split("(")[0].trim()} · {w.startTime}
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-card-border flex items-center justify-between text-[11px] text-muted px-2">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-accent" /> Reserva con el 50%
              </span>
              <Link
                href="/workshops"
                onClick={onCloseWorkshops}
                className="font-bold text-foreground hover:text-accent"
              >
                Ver los 8 Talleres Completos
              </Link>
            </div>
          </div>
        )}
      </div>

      <div
        id="courses-dropdown-container"
        className="relative"
        onMouseEnter={onCoursesEnter}
        onMouseLeave={onCoursesLeave}
        onFocus={onCoursesEnter}
        onBlur={onCoursesLeave}
      >
        <Link
          href="/cursos"
          className={`font-display text-sm font-semibold transition-colors relative group flex items-center gap-1.5 ${linkColor} ${
            isCursosActive ? "text-accent font-bold" : ""
          }`}
        >
          Cursos Online
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${
              coursesOpen ? "rotate-180 text-accent" : "opacity-70"
            }`}
          />
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition duration-300 group-hover:w-full" />
        </Link>

        {coursesOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[460px] bg-card border border-card-border rounded-3xl p-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between px-3 py-2 border-b border-card-border mb-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 flex items-center gap-1.5">
                  <GraduationCap size={14} /> Cursos Online
                </p>
                <p className="text-[11px] text-muted">Aprende a tu propio ritmo · Clases en video HD</p>
              </div>
              <Link
                href="/cursos"
                onClick={onCloseCourses}
                className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1"
              >
                Ver Todos &rarr;
              </Link>
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {ONLINE_COURSES_DATA.map((c) => (
                <Link
                  key={c.id}
                  href={`/cursos/${c.slug}`}
                  onClick={onCloseCourses}
                  className="p-3 rounded-2xl hover:bg-card-hover transition-colors group flex items-center justify-between border border-transparent hover:border-accent/20"
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      {c.badge && (
                        <span className="text-[9px] font-black uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/20 px-2 py-0.5 rounded-md">
                          {c.badge}
                        </span>
                      )}
                      <span className="text-[11px] text-muted font-medium">
                        {c.totalClasses} clases · {c.totalHours} hrs
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {c.shortTitle}
                    </p>
                    <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{c.subtitle}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-foreground font-mono block">
                      ${c.price} USD
                    </span>
                    <span className="text-[9px] font-bold text-accent">Ver Curso &rarr;</span>
                  </div>
                </Link>
              ))}

              <Link
                href="/cursos"
                onClick={onCloseCourses}
                className="p-3 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/5 border border-pink-500/20 flex items-center justify-between group hover:border-pink-500/40 transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-foreground group-hover:text-accent transition-colors flex items-center gap-1.5">
                    <Sparkles size={13} className="text-accent" /> Promoción Cupón Especial
                  </p>
                  <p className="text-[11px] text-muted mt-0.5">
                    Aplica el cupón <strong className="text-accent">TODOSLOSCURSOS</strong> al comprar ambos cursos online
                  </p>
                </div>
                <span className="text-[11px] font-bold text-accent group-hover:underline">
                  Explorar &rarr;
                </span>
              </Link>
            </div>

            <div className="mt-3 pt-3 border-t border-card-border flex items-center justify-between text-[11px] text-muted px-2">
              <span className="flex items-center gap-1">
                <BookOpen size={12} className="text-accent" /> Acceso Inmediato 24/7
              </span>
              <Link
                href="/cursos"
                onClick={onCloseCourses}
                className="font-bold text-foreground hover:text-accent"
              >
                Ver Todos los Cursos Online
              </Link>
            </div>
          </div>
        )}
      </div>

      <NavLinkUnderline
        href="/pasteleria"
        label="Pastelería & Tortas"
        linkColor={linkColor}
        active={pathname === "/pasteleria"}
      />
      <NavLinkUnderline
        href="/nosotros"
        label="Sobre Anais"
        linkColor={linkColor}
        active={pathname === "/nosotros"}
      />

      {hasSession && hasMisCursos && (
        <NavLinkUnderline
          href="/mis-cursos"
          label="Mis Cursos"
          linkColor={linkColor}
          active={pathname === "/mis-cursos"}
        />
      )}

      {hasSession && (
        <NavLinkUnderline
          href="/dashboard"
          label="Mi Panel"
          linkColor={linkColor}
          active={pathname === "/dashboard"}
        />
      )}
    </nav>
  );
}
