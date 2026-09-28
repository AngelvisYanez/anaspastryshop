"use client";

import { Loader2 } from "lucide-react";
import { CopyButton } from "@/components/CopyButton";

export function BcvConversionBox({
  totalBolivares,
  effectiveBcvRate,
  bcvLoading,
  bcvDateLabel,
}: {
  totalBolivares: number | null;
  effectiveBcvRate: number | null;
  bcvLoading: boolean;
  bcvDateLabel: string | null;
}) {
  return (
    <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Total a transferir en Bolívares
            </span>
            {bcvLoading && <Loader2 size={12} className="animate-spin text-emerald-600" />}
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl sm:text-3xl font-black text-foreground font-mono">
              {totalBolivares !== null
                ? `Bs. ${totalBolivares.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "Calculando..."}
            </p>
            {totalBolivares !== null && <CopyButton text={totalBolivares.toFixed(2)} />}
          </div>
        </div>
        <div className="bg-card/90 rounded-xl px-3.5 py-2 border border-card-border text-left sm:text-right shrink-0">
          <p className="text-[11px] font-bold text-muted">Tasa BCV del día</p>
          <p className="text-xs font-black text-foreground font-mono">
            {effectiveBcvRate
              ? `1 USD = Bs. ${effectiveBcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "Obteniendo..."}
          </p>
          {bcvDateLabel && (
            <p className="text-[9px] text-muted truncate max-w-[150px]">Fecha: {bcvDateLabel}</p>
          )}
        </div>
      </div>
    </div>
  );
}
