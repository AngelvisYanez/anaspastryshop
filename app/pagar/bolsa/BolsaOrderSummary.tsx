"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { CouponResult } from "@/lib/actions/coupons";

export interface BagCourse {
  id: string;
  title: string;
  price: number;
  image?: string | null;
  isWorkshop: boolean;
}

export function BolsaOrderSummary({
  courses,
  total,
  effectivePrice,
  appliedCoupon,
}: {
  courses: BagCourse[];
  total: number;
  effectivePrice: number;
  appliedCoupon: CouponResult | null;
}) {
  return (
    <div className="bg-card border border-card-border rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag size={16} className="text-accent" />
          <span className="text-xs font-black uppercase tracking-wider text-foreground">
            Resumen de tu Bolsa
          </span>
        </div>
        <span className="text-[11px] font-bold text-accent">
          {courses.length} {courses.length === 1 ? "formación" : "formaciones"}
        </span>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex items-center gap-3 rounded-2xl border border-card-border bg-background/50 p-3"
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted/20 shrink-0">
              <Image
                src={course.image || "/foto-1.webp"}
                alt={course.title}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span
                className={`text-[9px] font-black uppercase tracking-widest block mb-0.5 ${
                  course.isWorkshop
                    ? "text-accent"
                    : "text-purple-600 dark:text-purple-400"
                }`}
              >
                {course.isWorkshop ? "Workshop Presencial" : "Curso Online"}
              </span>
              <p className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                {course.title}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-foreground font-mono">${course.price}</p>
              <span className="text-[10px] text-muted">USD</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-card-border">
        {appliedCoupon ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <span className="text-xs text-muted line-through mr-2 font-bold font-mono">
                ${total}
              </span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                -{appliedCoupon.discountPercent}% con cupón
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
              ${effectivePrice}
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted">
              Total Bolsa
            </span>
            <div className="text-right">
              <p className="text-2xl font-black text-accent tracking-tight font-mono">${total}</p>
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                USD · Pago Único
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
