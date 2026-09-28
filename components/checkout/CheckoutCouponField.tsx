"use client";

import { Tag, CheckCircle, AlertCircle } from "lucide-react";

export function CheckoutCouponField({
  inputId,
  couponInput,
  onCouponInput,
  applied,
  loading,
  message,
  onApply,
  onRemove,
  onUsePromo,
}: {
  inputId: string;
  couponInput: string;
  onCouponInput: (value: string) => void;
  applied: boolean;
  loading: boolean;
  message: { text: string; success: boolean } | null;
  onApply: () => void;
  onRemove: () => void;
  onUsePromo?: () => void;
}) {
  return (
    <div className="bg-card border border-card-border rounded-3xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-accent" />
          <span className="text-xs font-black uppercase tracking-wider text-foreground">
            Cupón de Promoción
          </span>
        </div>
        {!applied && onUsePromo && (
          <button
            type="button"
            onClick={onUsePromo}
            className="text-[11px] font-bold text-accent hover:underline"
          >
            Usar TODOSLOSCURSOS
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Cupón de descuento
        </label>
        <input
          id={inputId}
          type="text"
          value={couponInput}
          onChange={(e) => onCouponInput(e.target.value.toUpperCase())}
          placeholder="Ingresa tu cupón..."
          disabled={loading || applied}
          className="flex-1 bg-background border border-card-border rounded-2xl px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider outline-none focus:border-accent text-foreground disabled:opacity-60"
        />
        {applied ? (
          <button
            type="button"
            onClick={onRemove}
            className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl text-xs font-bold transition-colors"
          >
            Quitar
          </button>
        ) : (
          <button
            type="button"
            onClick={onApply}
            disabled={loading || !couponInput.trim()}
            className="px-5 py-3 bg-accent-solid hover:bg-accent-solid-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider transition disabled:opacity-50 shadow-md shadow-accent-solid/20"
          >
            {loading ? "Validando..." : "Aplicar"}
          </button>
        )}
      </div>

      {message && (
        <p
          className={`text-xs font-medium flex items-center gap-1.5 ${
            message.success ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
          }`}
        >
          {message.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {message.text}
        </p>
      )}
    </div>
  );
}
