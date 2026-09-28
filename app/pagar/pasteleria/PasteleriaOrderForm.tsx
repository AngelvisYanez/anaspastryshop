"use client";

import { Sparkles } from "lucide-react";

export function PasteleriaOrderForm({
  serviceDescription,
  onServiceDescription,
  amountPaidStr,
  onAmountPaidStr,
}: {
  serviceDescription: string;
  onServiceDescription: (value: string) => void;
  amountPaidStr: string;
  onAmountPaidStr: (value: string) => void;
}) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-accent">
        <Sparkles size={16} />
        <h2 className="text-xs font-black uppercase tracking-widest text-foreground">
          Información de tu Pedido o Cotización
        </h2>
      </div>

      <div>
        <label
          htmlFor="pasteleria-service-description"
          className="text-[11px] font-black uppercase tracking-widest text-muted block mb-1.5 ml-1"
        >
          Descripción o Concepto del Pedido
        </label>
        <input
          id="pasteleria-service-description"
          type="text"
          required
          value={serviceDescription}
          onChange={(e) => onServiceDescription(e.target.value)}
          placeholder="Ej. Torta de Bodas 3 pisos sabor Red Velvet, Mesa de dulces 50 pers."
          className="w-full bg-background border border-card-border rounded-2xl py-3.5 px-4 outline-none focus:border-accent text-foreground text-sm font-medium"
        />
      </div>

      <div>
        <label
          htmlFor="pasteleria-amount"
          className="text-[11px] font-black uppercase tracking-widest text-muted block mb-1.5 ml-1"
        >
          Monto acordado a pagar (USD $)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-black text-sm">
            $
          </span>
          <input
            id="pasteleria-amount"
            type="number"
            step="0.01"
            min="1"
            required
            value={amountPaidStr}
            onChange={(e) => onAmountPaidStr(e.target.value)}
            placeholder="Ej. 120.00"
            className="w-full bg-background border border-card-border rounded-2xl py-3.5 pl-9 pr-14 outline-none focus:border-accent text-foreground text-base font-bold font-mono"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-muted uppercase">
            USD
          </span>
        </div>
      </div>
    </div>
  );
}
