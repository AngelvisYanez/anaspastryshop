"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Check, Loader2, CreditCard, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FEATURES = [
  "Módulos completos de crédito personal y empresarial",
  "Sesiones en vivo con Rami Noureddine, mes a mes",
  "Comunidad activa con actualizaciones en tiempo real",
  "Estrategias probadas para construir y reparar crédito",
  "Acceso a grabaciones y material exclusivo",
  "Orientación directa para tu situación específica",
];

export default function SubscriptionCheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(97);

  useEffect(() => {
    fetch("/api/settings/site-config")
      .then((r) => r.json())
      .then((cfg) => { if (cfg.subscriptionPrice) setPrice(cfg.subscriptionPrice); })
      .catch(() => {});
  }, []);

  async function handleStripeCheckout() {
    if (!session) {
      router.push("/iniciar-sesion?callbackUrl=/pagar/membresia");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/subscription", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Error al procesar el pago");
        setLoading(false);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={40} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent-subtle border border-card-border px-4 py-2 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              Membresía Academia Credito USA
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter mb-4">
            Únete a la Academia
          </h1>
          <p className="text-muted font-medium max-w-xl mx-auto">
            Todo lo que necesitas para dominar el crédito en Estados Unidos en un solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-section-alt rounded-xl p-8 border border-card-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-6">
              Lo que incluye tu membresía
            </p>
            <ul className="space-y-0">
              {FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-3 py-3.5 border-b border-card-border last:border-b-0 text-sm text-muted font-medium leading-snug">
                  <Check size={16} className="text-accent mt-0.5 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-8 shadow-xl">
            <div className="mb-6">
              <p className="text-xs text-muted font-bold uppercase tracking-widest mb-1">Precio mensual</p>
              <p className="text-5xl font-black text-accent tracking-tighter">
                ${price}
                <span className="text-lg font-bold text-muted tracking-normal"> / mes</span>
              </p>
              <p className="text-xs text-muted mt-2">Cancela cuando quieras.</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6">
                {error}
              </div>
            )}

            <button
              onClick={handleStripeCheckout}
              disabled={loading}
              className="w-full bg-accent text-white py-5 rounded-2xl font-bold shadow-xl shadow-accent/20 hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-3 mb-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
              {loading ? "Redirigiendo..." : `Suscribirme — $${price}/mes`}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <Shield size={14} />
              Pago seguro con Stripe. Datos protegidos con SSL.
            </div>

            {!session && (
              <p className="text-center text-xs text-muted mt-4">
                ¿Ya tienes cuenta?{" "}
                <Link href="/iniciar-sesion?callbackUrl=/pagar/membresia" className="text-accent font-bold hover:underline">
                  Inicia sesión
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
