"use client";
import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  X, CreditCard, Bitcoin, Copy, Check, Loader2, Building2,
} from "lucide-react";
import { createInscription } from "@/lib/actions/inscription";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type GatewayConfig = Record<string, string | number | null | undefined>;

export default function CheckoutModal({
  isOpen,
  onClose,
  price,
  title,
  cursoId,
}: {
  isOpen: boolean;
  onClose: () => void;
  price: number;
  title: string;
  cursoId?: string;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [method, setMethod] = useState<"stripe" | "zelle" | "bank_transfer" | "usdt" | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig | null>(null);
  const [gatewayLoading, setGatewayLoading] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    if (!method || method === "stripe") {
      setGatewayConfig(null);
      return;
    }
    const providerMap: Record<string, string> = {
      zelle: "ZELLE",
      bank_transfer: "BANK_TRANSFER",
      usdt: "USDT",
    };
    const provider = providerMap[method];
    setGatewayLoading(true);
    setGatewayConfig(null);
    fetch(`/api/gateways/${provider}`)
      .then((r) => r.json())
      .then((d) => setGatewayConfig(d.enabled && d.config ? d.config : null))
      .catch(() => setGatewayConfig(null))
      .finally(() => setGatewayLoading(false));
  }, [method]);

  async function handleStripeCheckout() {
    if (!cursoId) return;
    if (!session) {
      router.push(`/auth/login?callbackUrl=/cursos/${cursoId}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cursoId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Error al iniciar el pago");
        setLoading(false);
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!method || method === "stripe") return;
    if (!session) {
      router.push(`/auth/login?callbackUrl=/cursos/${cursoId}`);
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const reference = formData.get("reference")?.toString();
    const phoneNumber = formData.get("phoneNumber")?.toString();

    const dbMethodMap: Record<string, "ZELLE" | "BANK_TRANSFER" | "USDT"> = {
      zelle: "ZELLE",
      bank_transfer: "BANK_TRANSFER",
      usdt: "USDT",
    };

    const result = await createInscription({
      method: dbMethodMap[method],
      amountPaid: price,
      reference,
      phoneNumber,
      cursoId,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        onClose();
        router.push("/dashboard");
      }, 3000);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          />

          <m.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-card border border-card-border w-full max-w-xl rounded-2xl p-8 md:p-12 shadow-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-muted hover:text-foreground">
              <X />
            </button>

            {success ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-4">¡Solicitud Recibida!</h2>
                <p className="text-muted font-medium text-lg">
                  Hemos recibido tu pago para <span className="text-accent">{title}</span>. Te daremos acceso pronto.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-black mb-1 text-foreground">
                  Acceder a <span className="text-accent">{title}</span>
                </h2>
                <p className="text-muted mb-2 font-medium">Precio: <span className="font-black text-foreground">${price} USD</span></p>
                <p className="text-muted mb-8 font-medium text-sm">Selecciona tu método de pago preferido</p>

                {error && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold mb-6 text-center">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { id: "stripe" as const, icon: CreditCard, label: "Tarjeta / Stripe", badge: "Recomendado" },
                    { id: "zelle" as const, icon: CreditCard, label: "Zelle" },
                    { id: "bank_transfer" as const, icon: Building2, label: "Transferencia Bancaria" },
                    { id: "usdt" as const, icon: Bitcoin, label: "USDT / Cripto" },
                  ].map(({ id, icon: Icon, label, badge }) => (
                    <button
                      key={id}
                      onClick={() => { setMethod(id); setError(null); }}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === id ? "border-accent bg-accent-subtle" : "border-card-border"}`}
                    >
                      <Icon size={20} className={method === id ? "text-accent" : "text-muted"} />
                      <span className="text-[10px] font-black uppercase">{label}</span>
                      {badge && <span className="text-[9px] text-green-500 font-bold">{badge}</span>}
                    </button>
                  ))}
                </div>

                {method === "stripe" && (
                  <button
                    onClick={handleStripeCheckout}
                    disabled={loading}
                    className="w-full bg-accent text-white py-5 rounded-2xl font-bold shadow-xl hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <CreditCard size={20} />}
                    Pagar con Tarjeta — ${price}
                  </button>
                )}

                {(method === "zelle" || method === "bank_transfer" || method === "usdt") && (
                  <form key={method} onSubmit={handleSubmit}>
                    {gatewayLoading ? (
                      <div className="flex items-center justify-center py-10">
                        <Loader2 size={24} className="animate-spin text-accent" />
                      </div>
                    ) : (
                      <>
                        {method === "zelle" && (
                          <m.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card-hover border border-card-border p-6 rounded-xl mb-6"
                          >
                            <p className="text-xs font-black text-muted uppercase tracking-widest mb-2">Enviar a:</p>
                            {gatewayConfig?.email ? (
                              <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-card-border mb-4">
                                <span className="font-bold text-foreground">{gatewayConfig.email as string}</span>
                                <button type="button" onClick={() => copyToClipboard(gatewayConfig.email as string, "zelle-email")}>
                                  {copied === "zelle-email" ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-muted" />}
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-muted bg-card p-4 rounded-xl border border-card-border mb-4">
                                Contáctanos para recibir los datos de pago por Zelle.
                              </p>
                            )}
                            <div className="space-y-2">
                              <label className="text-xs font-black text-muted uppercase tracking-widest ml-2">Nombre del Titular / Referencia</label>
                              <input
                                name="reference"
                                required
                                type="text"
                                placeholder="Ej. Juan García o ID de confirmación"
                                className="w-full p-4 rounded-xl bg-card border border-card-border outline-none focus:ring-2 focus:ring-accent text-sm text-foreground"
                              />
                            </div>
                          </m.div>
                        )}

                        {method === "bank_transfer" && (
                          <m.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card-hover border border-card-border p-6 rounded-xl mb-6 space-y-4"
                          >
                            <p className="text-xs font-black text-muted uppercase tracking-widest">Datos bancarios:</p>
                            {gatewayConfig ? (
                              <div className="text-sm text-muted space-y-1 bg-card p-4 rounded-xl border border-card-border">
                                {gatewayConfig.bankName && (
                                  <p><b className="text-foreground">Banco:</b> {gatewayConfig.bankName as string}</p>
                                )}
                                {gatewayConfig.accountName && (
                                  <p><b className="text-foreground">Titular:</b> {gatewayConfig.accountName as string}</p>
                                )}
                                {gatewayConfig.accountNumber && (
                                  <div className="flex justify-between items-center">
                                    <p><b className="text-foreground">Cuenta:</b> {gatewayConfig.accountNumber as string}</p>
                                    <button type="button" onClick={() => copyToClipboard(gatewayConfig.accountNumber as string, "account-number")}>
                                      {copied === "account-number" ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-muted" />}
                                    </button>
                                  </div>
                                )}
                                {gatewayConfig.routingNumber && (
                                  <p><b className="text-foreground">Routing (ABA):</b> {gatewayConfig.routingNumber as string}</p>
                                )}
                                {gatewayConfig.accountType && (
                                  <p><b className="text-foreground">Tipo:</b> {gatewayConfig.accountType as string}</p>
                                )}
                                {gatewayConfig.instructions && (
                                  <p className="pt-1 text-xs italic">{gatewayConfig.instructions as string}</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted bg-card p-4 rounded-xl border border-card-border">
                                Contáctanos para recibir los datos de transferencia bancaria.
                              </p>
                            )}
                            <div className="space-y-2">
                              <label className="text-xs font-black text-muted uppercase tracking-widest ml-2">Referencia / Confirmación</label>
                              <input
                                name="reference"
                                required
                                type="text"
                                placeholder="Ej. número de confirmación o último 4 dígitos"
                                className="w-full p-4 rounded-xl bg-card border border-card-border outline-none focus:ring-2 focus:ring-accent text-sm text-foreground"
                              />
                            </div>
                          </m.div>
                        )}

                        {method === "usdt" && (
                          <m.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card-hover border border-card-border p-6 rounded-xl mb-6"
                          >
                            <p className="text-xs font-black text-muted uppercase tracking-widest mb-2">Binance Pay ID:</p>
                            {gatewayConfig?.binancePayId ? (
                              <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-card-border mb-4">
                                <span className="font-bold text-foreground">{gatewayConfig.binancePayId as string}</span>
                                <button type="button" onClick={() => copyToClipboard(gatewayConfig.binancePayId as string, "binance-id")}>
                                  {copied === "binance-id" ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-muted" />}
                                </button>
                              </div>
                            ) : (
                              <p className="text-sm text-muted bg-card p-4 rounded-xl border border-card-border mb-4">
                                Contáctanos para recibir los datos de pago por Binance.
                              </p>
                            )}
                            <div className="space-y-2">
                              <label className="text-xs font-black text-muted uppercase tracking-widest ml-2">ID de Transacción</label>
                              <input
                                name="reference"
                                required
                                type="text"
                                placeholder="Ej. TX-123456"
                                className="w-full p-4 rounded-xl bg-card border border-card-border outline-none focus:ring-2 focus:ring-accent text-sm text-foreground"
                              />
                            </div>
                          </m.div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full bg-navy dark:bg-accent text-white py-5 rounded-2xl font-bold shadow-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader2 className="animate-spin" size={20} /> : "Confirmar Pago"}
                        </button>
                      </>
                    )}
                  </form>
                )}
              </>
            )}
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
