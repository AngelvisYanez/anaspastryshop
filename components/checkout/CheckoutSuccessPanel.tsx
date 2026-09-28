"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import type { ReactNode } from "react";

export function CheckoutSuccessPanel({
  title = "¡Comprobante de inscripción recibido!",
  description,
  details,
  primaryHref,
  primaryLabel,
  secondaryHref = "/dashboard/mis-cursos",
  secondaryLabel = "Mis Cursos & Workshops",
}: {
  title?: string;
  description: ReactNode;
  details: ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="bg-card border border-card-border rounded-3xl p-8 sm:p-10 text-center shadow-xl">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 bg-green-100 dark:bg-green-950/30 rounded-full animate-pulse" />
        <div className="relative w-20 h-20 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center">
          <CheckCircle className="text-green-600" size={36} />
        </div>
      </div>
      <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">{title}</h2>
      <div className="text-muted font-medium leading-relaxed mb-2">{description}</div>
      <p className="text-xs text-muted mb-8 font-medium">
        Nuestro equipo verificará tu comprobante y habilitará tu acceso en el panel de alumno.
      </p>

      <div className="bg-section-alt rounded-2xl p-5 mb-8 text-left space-y-2 border border-card-border">
        {details}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={primaryHref}
          className="flex-1 bg-accent-solid text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-accent-solid-hover transition shadow-md shadow-accent-solid/20 text-center"
        >
          {primaryLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="flex-1 bg-card border border-card-border text-foreground hover:bg-card-hover py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition text-center"
        >
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}

export function SuccessDetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-muted font-medium">{label}</span>
      <span className="font-bold text-foreground truncate max-w-[200px]">{value}</span>
    </div>
  );
}
