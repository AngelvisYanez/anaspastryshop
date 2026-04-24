"use client";
import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  X, CreditCard, Smartphone, Bitcoin, Copy, Check, Loader2,
} from "lucide-react";
import { createInscription } from "@/lib/actions/inscription";
import { useRouter } from "next/navigation";

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
  const [method, setMethod] = useState<"stripe" | "zelle" | "bcv" | "usdt" | null>(null);
  const [copied, setCopied] = useState(false);
  const tasaBCV = 36.5;
  const montoBS = (price * tasaBCV).toFixed(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  async function handleStripeCheckout() {
    if (!cursoId) return;
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

    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const reference = formData.get("reference")?.toString();
    const phoneNumber = formData.get("phoneNumber")?.toString();

    let dbMethod: "ZELLE" | "PAGO_MOVIL" | "USDT" | "TRANSFERENCIA" = "ZELLE";
    if (method === "bcv") dbMethod = "PAGO_MOVIL";
    if (method === "usdt") dbMethod = "USDT";

    const result = await createInscription({
      method: dbMethod,
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
            className="bg-card border border-card-border w-full max-w-xl rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10 overflow-hidden max-h-[90vh] overflow-y-auto"
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
                  <button
                    onClick={() => setMethod("stripe")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === "stripe" ? "border-accent bg-accent-subtle" : "border-card-border"}`}
                  >
                    <CreditCard size={20} className={method === "stripe" ? "text-accent" : "text-muted"} />
                    <span className="text-[10px] font-black uppercase">Tarjeta / Stripe</span>
                    <span className="text-[9px] text-green-500 font-bold">Recomendado</span>
                  </button>
                  <button
                    onClick={() => setMethod("zelle")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === "zelle" ? "border-accent bg-accent-subtle" : "border-card-border"}`}
                  >
                    <CreditCard size={20} className={method === "zelle" ? "text-accent" : "text-muted"} />
                    <span className="text-[10px] font-black uppercase">Zelle</span>
                  </button>
                  <button
                    onClick={() => setMethod("bcv")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === "bcv" ? "border-accent bg-accent-subtle" : "border-card-border"}`}
                  >
                    <Smartphone size={20} className={method === "bcv" ? "text-accent" : "text-muted"} />
                    <span className="text-[10px] font-black uppercase">Pago Móvil</span>
                  </button>
                  <button
                    onClick={() => setMethod("usdt")}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === "usdt" ? "border-accent bg-accent-subtle" : "border-card-border"}`}
                  >
                    <Bitcoin size={20} className={method === "usdt" ? "text-accent" : "text-muted"} />
                    <span className="text-[10px] font-black uppercase">Binance</span>
                  </button>
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

                {(method === "zelle" || method === "bcv" || method === "usdt") && (
                  <form onSubmit={handleSubmit}>
                    {method === "zelle" && (
                      <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card-hover border border-card-border p-6 rounded-[2rem] mb-6"
                      >
                        <p className="text-xs font-black text-muted uppercase tracking-widest mb-2">Enviar a:</p>
                        <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-card-border mb-4">
                          <span className="font-bold text-foreground">pagos@academiacreditousa.com</span>
                          <button type="button" onClick={() => copyToClipboard("pagos@academiacreditousa.com")}>
                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-muted" />}
                          </button>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-muted uppercase tracking-widest ml-2">Referencia / Titular</label>
                          <input name="reference" required type="text" placeholder="Ej. Juan García" className="w-full p-4 rounded-xl bg-card border border-card-border outline-none focus:ring-2 focus:ring-accent text-sm text-foreground" />
                        </div>
                      </m.div>
                    )}

                    {method === "bcv" && (
                      <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card-hover border border-card-border p-6 rounded-[2rem] mb-6 space-y-4"
                      >
                        <div className="flex justify-between items-end">
                          <p className="text-xs font-black text-muted uppercase tracking-widest">Monto (BCV):</p>
                          <span className="text-2xl font-black text-foreground">Bs. {montoBS}</span>
                        </div>
                        <div className="text-sm text-muted space-y-1 bg-card p-4 rounded-xl border border-card-border">
                          <p><b className="text-foreground">Banco:</b> Banesco (0134)</p>
                          <p><b className="text-foreground">Teléfono:</b> 0412-1234567</p>
                          <p><b className="text-foreground">RIF:</b> J-123456789</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Referencia</label>
                            <input name="reference" required type="text" placeholder="Ej. 123456" className="w-full p-3 rounded-xl bg-card border border-card-border outline-none focus:ring-2 focus:ring-accent text-sm text-foreground" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-2">Teléfono emisor</label>
                            <input name="phoneNumber" required type="text" placeholder="Ej. 0412..." className="w-full p-3 rounded-xl bg-card border border-card-border outline-none focus:ring-2 focus:ring-accent text-sm text-foreground" />
                          </div>
                        </div>
                      </m.div>
                    )}

                    {method === "usdt" && (
                      <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card-hover border border-card-border p-6 rounded-[2rem] mb-6"
                      >
                        <p className="text-xs font-black text-muted uppercase tracking-widest mb-2">Binance Pay ID:</p>
                        <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-card-border mb-4">
                          <span className="font-bold text-foreground">Academia Credito USA</span>
                          <button type="button" onClick={() => copyToClipboard("AcademiaCreditoUSA")}>
                            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-muted" />}
                          </button>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-muted uppercase tracking-widest ml-2">ID de Transacción</label>
                          <input name="reference" required type="text" placeholder="Ej. TX-123456" className="w-full p-4 rounded-xl bg-card border border-card-border outline-none focus:ring-2 focus:ring-accent text-sm text-foreground" />
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
