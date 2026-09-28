"use client";

import { Loader2, Shield } from "lucide-react";

const DEFAULT_EMPTY =
  "Los datos de pago están siendo actualizados por administración. Por favor recarga la página o contáctanos directamente.";

export function GatewayPanel({
  loading,
  hasGateway,
  children,
  emptyMessage = DEFAULT_EMPTY,
  className = "bg-card border border-card-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6",
}: {
  loading: boolean;
  hasGateway: boolean;
  children: React.ReactNode;
  emptyMessage?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted gap-2">
          <Loader2 size={28} className="animate-spin text-accent" />
          <p className="text-xs font-bold">Cargando opciones de pago...</p>
        </div>
      ) : !hasGateway ? (
        <div className="bg-section-alt rounded-2xl p-6 text-center">
          <p className="text-sm text-muted font-medium">{emptyMessage}</p>
        </div>
      ) : (
        children
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-muted pt-1">
        <Shield size={13} />
        Verificación manual segura por el equipo de Ana&apos;s Pastry Shop.
      </div>
    </div>
  );
}
