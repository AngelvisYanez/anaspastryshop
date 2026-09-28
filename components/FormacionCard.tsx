"use client";

import Link from "next/link";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import AddToBagButton from "@/components/cart/AddToBagButton";
import FormacionCover from "@/components/FormacionCover";

export interface FormacionCardData {
  id: string;
  slug?: string;
  title: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category?: string;
  level?: string | null;
  totalHours?: number | null;
  totalClasses?: number | null;
  modulesCount?: number;
  isWorkshop: boolean;
  workshopLocation?: string;
  workshopDate?: string;
  workshopTime?: string;
  hasAccess?: boolean;
  bagId?: string;
}

function detailHrefFor(course: FormacionCardData) {
  if (!course.slug) return `/cursos/${course.id}`;
  return course.isWorkshop ? `/workshop/${course.slug}` : `/cursos/${course.slug}`;
}

function FormacionCardMeta({ course }: { course: FormacionCardData }) {
  if (course.isWorkshop) {
    return (
      <div className="flex items-center justify-between text-xs text-muted font-medium pt-3 border-t border-card-border/60">
        <span className="flex items-center gap-1.5 text-foreground font-semibold">
          <Calendar size={13} className="text-accent shrink-0" />
          {course.workshopDate || "Próximamente"}
        </span>
        {course.workshopDate && (
          <span className="flex items-center gap-1.5 text-foreground font-semibold">
            <Clock size={13} className="text-accent shrink-0" />
            {course.workshopTime || "09:00 AM — 05:00 PM"}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-xs text-muted font-medium pt-3 border-t border-card-border/60">
      <span className="flex items-center gap-1.5">
        <Clock size={13} className="text-accent shrink-0" /> {course.totalHours ?? 0} hrs
      </span>
      <span>•</span>
      <span className="text-accent font-semibold">
        {course.modulesCount || 0} módulos disponibles
      </span>
    </div>
  );
}

export default function FormacionCard({ course }: { course: FormacionCardData }) {
  const isWorkshop = course.isWorkshop;
  const detailHref = detailHrefFor(course);
  const bagId = course.bagId ?? course.id;

  const viewActionLabel = course.hasAccess
    ? "Entrar al Curso"
    : isWorkshop
      ? "Ver Taller"
      : "Ver Curso";

  return (
    <div className="bg-card border border-card-border rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/40 transition flex flex-col group h-full min-w-0">
      <Link
        href={detailHref}
        className="relative w-full aspect-square shrink-0 overflow-hidden block group/cover bg-section-alt"
        aria-label={course.title}
      >
        <FormacionCover
          image={course.image}
          title={course.title}
          category={course.category}
          isWorkshop={isWorkshop}
          slug={course.slug}
        />
      </Link>

      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-lg shrink-0">
              {isWorkshop ? "Workshop Presencial" : "Curso Online"}
            </span>
            {course.level && (
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider truncate">
                {course.level}
              </span>
            )}
          </div>

          <Link href={detailHref} className="block group/title min-w-0">
            <h3 className="font-display text-base sm:text-lg lg:text-xl font-black text-foreground mb-2 group-hover/title:text-accent transition-colors line-clamp-2">
              {course.title}
            </h3>
          </Link>

          <p className="text-muted text-xs line-clamp-2 leading-relaxed mb-3 sm:mb-4 font-medium">
            {course.description || "Formación práctica desde cero con técnicas profesionales."}
          </p>

          <FormacionCardMeta course={course} />
        </div>

        <div className="pt-3 sm:pt-4 border-t border-card-border space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] text-muted font-bold uppercase tracking-wider shrink-0">
              {isWorkshop ? "Inversión Taller" : "Acceso Permanente"}
            </span>
            <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
              ${course.price}{" "}
              <span className="text-xs font-bold text-muted uppercase">USD</span>
            </span>
          </div>

          <div className={`grid gap-2 ${course.hasAccess ? "grid-cols-1" : "grid-cols-2"}`}>
            <Link
              href={detailHref}
              className="h-10 bg-accent-solid hover:bg-accent-solid-hover text-white px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-accent-solid/20 w-full min-w-0"
            >
              <span className="truncate">{viewActionLabel}</span>
              <ArrowRight size={13} className="shrink-0" />
            </Link>

            {!course.hasAccess && (
              <AddToBagButton
                compact
                labelAdd="Añadir"
                labelRemove="Quitar"
                openDrawerOnAdd={false}
                item={{
                  id: bagId,
                  title: course.title,
                  price: course.price,
                  image: isWorkshop ? null : (course.image ?? null),
                  isWorkshop,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
