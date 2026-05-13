"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CheckCircle, Loader2 } from "lucide-react";

export default function PendingPaymentDialog() {
  const router = useRouter();
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/membresia/status");
        const data = await res.json();
        if (data.hasActiveSubscription) {
          setActivated(true);
          clearInterval(interval);
          setTimeout(() => {
            router.refresh();
          }, 2500);
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-card-border rounded-2xl p-10 text-center shadow-2xl">
        {activated ? (
          <>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={40} />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3 tracking-tighter">
              ¡Membresía activada!
            </h2>
            <p className="text-muted font-medium leading-relaxed">
              Tu pago fue aprobado. Abriendo tu panel...
            </p>
          </>
        ) : (
          <>
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-amber-100 dark:bg-amber-950/30 rounded-full animate-pulse" />
              <div className="relative w-20 h-20 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center">
                <Clock className="text-amber-500" size={36} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3 tracking-tighter">
              Pago en verificación
            </h2>
            <p className="text-muted font-medium leading-relaxed mb-2">
              Estamos revisando tu comprobante de pago.
            </p>
            <p className="text-sm text-muted font-medium mb-8">
              Cuando tu membresía sea aprobada, el panel se abrirá automáticamente.
              También recibirás un email de confirmación.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <Loader2 size={13} className="animate-spin" />
              Verificando estado de tu pago...
            </div>
          </>
        )}
      </div>
    </div>
  );
}
