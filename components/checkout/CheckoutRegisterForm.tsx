"use client";

import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export function CheckoutRegisterForm({
  idPrefix,
  loading,
  onSubmit,
  loginHref,
  minPasswordLength = 6,
  submitLabel = "Continuar al Pago",
  loadingLabel,
}: {
  idPrefix: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loginHref: string;
  minPasswordLength?: number;
  submitLabel?: string;
  loadingLabel?: string;
}) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-8 shadow-xl">
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label
            htmlFor={`${idPrefix}-name`}
            className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1"
          >
            Nombre Completo
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              id={`${idPrefix}-name`}
              name="name"
              type="text"
              required
              placeholder="Ej. María Pérez"
              className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-email`}
            className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1"
          >
            Correo Electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              id={`${idPrefix}-email`}
              name="email"
              type="email"
              required
              placeholder="tu@correo.com"
              className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm font-medium"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor={`${idPrefix}-password`}
            className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1"
          >
            Contraseña de Acceso
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              id={`${idPrefix}-password`}
              name="password"
              type="password"
              required
              minLength={minPasswordLength}
              placeholder={`Mínimo ${minPasswordLength} caracteres`}
              className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-solid text-white py-4 rounded-2xl font-bold hover:bg-accent-solid-hover transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent-solid/20"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          {loading && loadingLabel ? loadingLabel : submitLabel}
        </button>
      </form>

      <p className="text-center text-xs text-muted mt-6 font-medium">
        ¿Ya tienes una cuenta registrada?{" "}
        <a href={loginHref} className="text-accent font-bold hover:underline">
          Inicia sesión aquí
        </a>
      </p>
    </div>
  );
}
