"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, MapPin, ArrowRight } from "lucide-react";
import AddToBagButton from "@/components/cart/AddToBagButton";

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

  return (
    <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-accent/40 transition-all flex flex-col group h-full">
      {/* Card Cover */}
      <Link href={detailHref} className="relative aspect-[16/10] overflow-hidden bg-muted/10 block">
        <Image
          src={course.image || "/foto-1.webp"}
          alt={course.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Card Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Workshop Presencial Logistics Bar */}
          {isWorkshop ? (
            <div className="pt-3 border-t border-pink-400/15 space-y-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <MapPin size={15} className="text-accent shrink-0" />
                <span className="truncate">{course.workshopLocation || "Sede Ana's Pastry Shop"}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted font-medium pt-1 border-t border-pink-400/15">
                <span className="flex items-center gap-1 text-foreground font-semibold">
                  <Calendar size={13} className="text-accent" />
                  {course.workshopDate || "Próximamente"}
                </span>
                {hasWorkshopDate && (
                  <span className="flex items-center gap-1 text-foreground font-semibold">
                    <Clock size={13} className="text-accent" />
                    {course.workshopTime || "09:00 AM — 05:00 PM"}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-xs text-muted mb-3">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock size={14} className="text-accent" /> {course.totalHours ?? 0} hrs de contenido
              </span>
              <span>•</span>
              <span className="font-semibold text-accent">
                {course.modulesCount || 0} módulos disponibles
              </span>
            </div>
          )}

          <Link href={detailHref}>
            <h3 className="font-display text-xl font-black text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
              {course.title}
            </h3>
          </Link>

          <p className="text-muted text-xs line-clamp-2 leading-relaxed mb-6 font-medium">
            {course.description || "Formación práctica desde cero con técnicas profesionales."}
          </p>
        </div>

        {/* Price & CTA */}
        <div className="pt-4 border-t border-card-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-muted font-bold block uppercase tracking-wider">
                {isWorkshop ? "Inversión Taller" : "Acceso Permanente"}
              </span>
              <span className="text-2xl font-black text-foreground">
                ${course.price}
              </span>
            </div>

            <Link href={detailHref}>
              <button className="bg-accent hover:bg-accent-hover text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-pink-600/20">
                {course.hasAccess
                  ? "Entrar al Curso"
                  : isWorkshop
                  ? "Ver Taller"
                  : "Ver Detalles"}{" "}
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {!course.hasAccess && (
            <AddToBagButton
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
  );
}