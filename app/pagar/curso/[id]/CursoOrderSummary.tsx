"use client";

import { MapPin, Calendar, Clock } from "lucide-react";
import type { CouponResult } from "@/lib/actions/coupons";
import { WORKSHOP_LOCATION, type WorkshopDetails } from "@/lib/utils/workshop";

export function CursoOrderSummary({
  course,
  isWorkshop,
  workshopInfo,
  appliedCoupon,
}: {
  course: {
    title: string;
    price: number;
    totalHours: number;
  };
  isWorkshop: boolean;
  workshopInfo?: WorkshopDetails;
  appliedCoupon: CouponResult | null;
}) {
  return (
    <div className="bg-card border border-card-border rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span
            className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md inline-block mb-1.5 ${
              isWorkshop
                ? "bg-accent/15 text-accent border border-accent/30"
                : "bg-accent/10 text-accent border border-accent/20"
            }`}
          >
            {isWorkshop ? "Workshop Presencial" : "Curso Online"}
          </span>
          <p className="font-bold text-foreground text-lg leading-tight">{course.title}</p>

          {isWorkshop ? (
            <div className="mt-2.5 space-y-1 text-xs text-muted">
              <div className="flex items-center gap-1.5 text-foreground font-semibold">
                <MapPin size={13} className="text-accent shrink-0" />
                <span>
                  {workshopInfo?.location || WORKSHOP_LOCATION}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[11px] pt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-accent" />
                  {workshopInfo?.workshopDate || "Próxima fecha"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-accent" />
                  {workshopInfo?.workshopTime || "09:00 AM — 05:00 PM"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted font-medium mt-1">
              {course.totalHours}h de contenido · Módulos y lecciones en video · Acceso permanente
            </p>
          )}
        </div>

        <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-card-border">
          {appliedCoupon ? (
            <div>
              <span className="text-xs text-muted line-through mr-2 font-bold font-mono">
                ${course.price}
              </span>
              <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                ${appliedCoupon.finalAmount}
              </p>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                -{appliedCoupon.discountPercent}% con cupón
              </span>
            </div>
          ) : (
            <div>
              <p className="text-3xl font-black text-accent tracking-tight font-mono">
                ${course.price}
              </p>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                USD · Pago Único
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
