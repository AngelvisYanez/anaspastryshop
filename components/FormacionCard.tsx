"use client";

import Link from "next/link";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import AddToBagButton from "@/components/cart/AddToBagButton";
import CourseCoverPlaceholder from "@/components/CourseCoverPlaceholder";

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

export default function FormacionCard({ course }: { course: FormacionCardData }) {
  const isWorkshop = course.isWorkshop;
  const detailHref =
    isWorkshop && course.slug ? `/workshop/${course.slug}` : `/cursos/${course.id}`;
  const bagId = course.bagId ?? course.id;
  const hasWorkshopDate = Boolean(course.workshopDate);

  const viewActionLabel = course.hasAccess
    ? "Entrar al Curso"
    : isWorkshop
    ? "Ver Taller"
    : "Ver Curso";

  return (
    <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/40 transition-all flex flex-col group h-full">
      {/* Card Cover: Branded placeholder with Ana's Pastry Shop logo */}
      <Link
        href={detailHref}
        className="relative aspect-[16/10] overflow-hidden block group/cover"
      >
        <CourseCoverPlaceholder
          title={course.title}
          category={course.category}
          isWorkshop={isWorkshop}
        />
      </Link>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Category / Level Badge */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-lg">
              {isWorkshop ? "Workshop Presencial" : "Curso Online"}
            </span>
            {course.level && (
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
                {course.level}
              </span>
            )}
          </div>

          {/* Title FIRST */}
          <Link href={detailHref} className="block group/title">
            <h3 className="font-display text-lg sm:text-xl font-black text-foreground mb-2 group-hover/title:text-accent transition-colors line-clamp-2">
              {course.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-muted text-xs line-clamp-2 leading-relaxed mb-4 font-medium">
            {course.description || "Formación práctica desde cero con técnicas profesionales."}
          </p>

          {/* Date & Time at the bottom of content (no bulky location to keep card clean) */}
          {isWorkshop ? (
            <div className="flex items-center justify-between text-xs text-muted font-medium pt-3 border-t border-card-border/60">
              <span className="flex items-center gap-1.5 text-foreground font-semibold">
                <Calendar size={13} className="text-accent shrink-0" />
                {course.workshopDate || "Próximamente"}
              </span>
              {hasWorkshopDate && (
                <span className="flex items-center gap-1.5 text-foreground font-semibold">
                  <Clock size={13} className="text-accent shrink-0" />
                  {course.workshopTime || "09:00 AM — 05:00 PM"}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-xs text-muted font-medium pt-3 border-t border-card-border/60">
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-accent shrink-0" /> {course.totalHours ?? 0} hrs
              </span>
              <span>•</span>
              <span className="text-accent font-semibold">
                {course.modulesCount || 0} módulos disponibles
              </span>
            </div>
          )}
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-4 border-t border-card-border mt-4 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-muted font-bold uppercase tracking-wider">
              {isWorkshop ? "Inversión Taller" : "Acceso Permanente"}
            </span>
            <span className="text-2xl font-black text-foreground">
              ${course.price}{" "}
              <span className="text-xs font-bold text-muted uppercase">USD</span>
            </span>
          </div>

          {/* Side by side: "Ver Taller / Ver Curso" + "Añadir / Quitar" */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={detailHref}
              className={course.hasAccess ? "col-span-2" : "w-full"}
            >
              <button
                type="button"
                className="w-full h-10 bg-accent hover:bg-accent-hover text-white px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-pink-600/20 cursor-pointer select-none"
              >
                <span className="truncate">{viewActionLabel}</span>
                <ArrowRight size={13} className="shrink-0" />
              </button>
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
                  image: course.image ?? null,
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
