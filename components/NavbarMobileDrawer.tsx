"use client";

import Link from "next/link";
import {
  ChevronRight, ChevronDown, Sparkles, GraduationCap, LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { WORKSHOPS_DATA } from "@/lib/data/workshops";
import { ONLINE_COURSES_DATA } from "@/lib/data/online-courses";

export function NavbarMobileDrawer({
  hasSession,
  hasMisCursos,
  workshopsOpen,
  coursesOpen,
  onToggleWorkshops,
  onToggleCourses,
  onClose,
}: {
  hasSession: boolean;
  hasMisCursos: boolean;
  workshopsOpen: boolean;
  coursesOpen: boolean;
  onToggleWorkshops: () => void;
  onToggleCourses: () => void;
  onClose: () => void;
}) {
  return (
    <div
      id="mobile-navigation"
      className="xl:hidden bg-card/95 backdrop-blur-xl border-b border-card-border px-6 py-6 space-y-4 shadow-2xl max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain pb-[calc(6rem+env(safe-area-inset-bottom))]"
    >
      <div className="flex flex-col space-y-2">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover text-foreground font-semibold text-sm transition-colors"
        >
          <span>Inicio</span>
          <ChevronRight size={16} className="text-muted" />
        </Link>

        <div className="rounded-xl border border-card-border/70 overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-section-alt">
            <Link
              href="/workshops"
              onClick={onClose}
              className="font-black text-sm text-pink-600 dark:text-pink-400 flex items-center gap-1.5"
            >
              <Sparkles size={14} /> Workshops Presenciales
            </Link>
            <button
              onClick={onToggleWorkshops}
              className="p-1 text-muted hover:text-foreground"
              aria-label="Desplegar workshops"
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  workshopsOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {workshopsOpen && (
            <div className="p-2 space-y-1 bg-card border-t border-card-border/60">
              <Link
                href="/workshops"
                onClick={onClose}
                className="block p-2 rounded-lg text-xs font-bold text-accent hover:bg-card-hover"
              >
                &rarr; Ver Cartelera Completa de Workshops
              </Link>
              {WORKSHOPS_DATA.map((w) => (
                <Link
                  key={w.slug}
                  href={`/workshop/${w.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2 rounded-lg text-xs text-foreground hover:bg-card-hover"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[9px] font-black text-pink-600 dark:text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded">
                      {w.spots}p
                    </span>
                    <span className="truncate">{w.shortTitle}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-accent shrink-0 ml-2">
                    ${w.price}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-card-border/70 overflow-hidden">
          <div className="flex items-center justify-between p-3 bg-section-alt">
            <Link
              href="/cursos"
              onClick={onClose}
              className="font-black text-sm text-foreground flex items-center gap-1.5"
            >
              <GraduationCap size={14} className="text-accent" /> Cursos Online
            </Link>
            <button
              onClick={onToggleCourses}
              className="p-1 text-muted hover:text-foreground"
              aria-label="Desplegar cursos online"
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  coursesOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {coursesOpen && (
            <div className="p-2 space-y-1 bg-card border-t border-card-border/60">
              <Link
                href="/cursos"
                onClick={onClose}
                className="block p-2 rounded-lg text-xs font-bold text-accent hover:bg-card-hover"
              >
                &rarr; Ver Catálogo Completo de Cursos Online
              </Link>
              {ONLINE_COURSES_DATA.map((c) => (
                <Link
                  key={c.id}
                  href={`/cursos/${c.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between p-2 rounded-lg text-xs text-foreground hover:bg-card-hover"
                >
                  <div className="truncate">
                    <span className="block truncate font-semibold">{c.shortTitle}</span>
                    <span className="text-[11px] text-muted">
                      {c.totalClasses} clases · {c.totalHours}h
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-accent shrink-0 ml-2">
                    ${c.price}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Link
          href="/pasteleria"
          onClick={onClose}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover text-foreground font-semibold text-sm transition-colors"
        >
          <span>Pastelería & Tortas</span>
          <ChevronRight size={16} className="text-muted" />
        </Link>

        <Link
          href="/nosotros"
          onClick={onClose}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover text-foreground font-semibold text-sm transition-colors"
        >
          <span>Sobre Anais</span>
          <ChevronRight size={16} className="text-muted" />
        </Link>

        {hasSession && hasMisCursos && (
          <Link
            href="/mis-cursos"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover text-foreground font-semibold text-sm transition-colors"
          >
            <span>Mis Cursos</span>
            <ChevronRight size={16} className="text-muted" />
          </Link>
        )}

        {hasSession && (
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-card-hover text-foreground font-semibold text-sm transition-colors"
          >
            <span>Mi Panel</span>
            <ChevronRight size={16} className="text-muted" />
          </Link>
        )}
      </div>

      <div className="pt-4 border-t border-card-border space-y-3">
        {hasSession ? (
          <button
            onClick={() => {
              onClose();
              signOut();
            }}
            className="w-full bg-red-500/10 text-red-500 py-3 rounded-xl font-bold text-xs hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Cerrar Sesión
          </button>
        ) : (
          <>
            <Link
              href="/iniciar-sesion"
              onClick={onClose}
              className="w-full bg-card border border-card-border text-foreground py-3 rounded-xl font-bold text-xs hover:bg-card-hover transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              onClick={onClose}
              className="w-full bg-brand-purple text-white py-3 rounded-xl font-bold text-xs hover:bg-brand-purple-deep active:bg-brand-purple-deep transition-colors shadow-md shadow-brand-purple/30"
            >
              Registrarse
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
