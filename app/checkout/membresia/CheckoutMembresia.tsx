"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Lock, ArrowRight, Loader2,
  Building2, Copy, Check, Shield, CheckCircle,
  Clock, Upload, ImageIcon,
} from "lucide-react";
import { registerUser } from "@/lib/actions/auth";
import { createSubscriptionInscription } from "@/lib/actions/inscription";
import Navbar from "@/components/Navbar";

type BankConfig = {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountType?: string;
  instructions?: string;
};

type Step = 1 | 2 | 3;

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Tu cuenta" },
    { n: 2, label: "Pago" },
    { n: 3, label: "Confirmación" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                step > s.n
                  ? "bg-green-500 text-white"
                  : step === s.n
                  ? "bg-navy dark:bg-accent text-white scale-110 shadow-lg"
                  : "bg-card border border-card-border text-muted"
              }`}
            >
              {step > s.n ? <Check size={16} /> : s.n}
            </div>
            <span
              className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${
                step === s.n ? "text-foreground" : "text-muted"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 h-px mx-2 mb-5 transition-all ${
                step > s.n ? "bg-green-400" : "bg-card-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="text-muted hover:text-accent transition-colors"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

export default function CheckoutMembresia({
  initialLoggedIn,
  initialName,
}: {
  initialLoggedIn: boolean;
  initialName?: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initialLoggedIn ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [price, setPrice] = useState<number>(97);
  const [planName, setPlanName] = useState("Membresía Academia");
  const [bankConfig, setBankConfig] = useState<BankConfig | null>(null);
  const [bankLoading, setBankLoading] = useState(false);

  const [reference, setReference] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings/site-config")
      .then((r) => r.json())
      .then((cfg) => {
        if (cfg.subscriptionPrice) setPrice(cfg.subscriptionPrice);
      })
      .catch(() => {});

    fetch("/api/membresia/plan-info")
      .then((r) => r.json())
      .then((d) => { if (d.name) setPlanName(d.name); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (step === 2) {
      setBankLoading(true);
      fetch("/api/gateways/BANK_TRANSFER")
        .then((r) => r.json())
        .then((d) => { if (d.enabled && d.config) setBankConfig(d.config); })
        .catch(() => {})
        .finally(() => setBankLoading(false));
    }
  }, [step]);

  async function handleReceiptUpload(file: File) {
    setUploadingReceipt(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cloudflare/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setReceiptImage(data.url);
      } else {
        setError("Error al subir el comprobante. Intenta de nuevo.");
      }
    } catch {
      setError("Error al subir el comprobante. Intenta de nuevo.");
    } finally {
      setUploadingReceipt(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      setError("Cuenta creada, pero hubo un error al iniciar sesión. Recarga la página.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(2);
  }

  async function handlePaymentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await createSubscriptionInscription({
      reference: reference.trim(),
      amountPaid: price,
      receiptImage: receiptImage || undefined,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep(3);
  }

  return (
    <main className="min-h-screen bg-background pb-16">
      <Navbar />
      <div className="relative overflow-hidden bg-[#0B1F3A] pt-32 pb-16 px-8 md:px-20 rounded-b-3xl mb-10 text-center">
        <div className="absolute inset-0 opacity-[0.025] noise-bg pointer-events-none" />
        <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-5%] right-[0%] w-[30%] h-[30%] bg-accent/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.1] px-4 py-2 rounded-xl mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              {planName}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter">
            {step === 1 && "Crea tu cuenta"}
            {step === 2 && "Realiza tu pago"}
            {step === 3 && "Comprobante enviado"}
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        <StepIndicator step={step} />

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="bg-card border border-card-border rounded-xl p-8 shadow-xl">
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Ej. Ana García"
                    className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                    className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-navy dark:bg-accent text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg mt-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {loading ? "Creando cuenta..." : "Continuar al Pago"}
              </button>
            </form>

            <p className="text-center text-xs text-muted mt-6">
              ¿Ya tienes cuenta?{" "}
              <a href="/auth/login?callbackUrl=/checkout/membresia" className="text-accent font-bold hover:underline">
                Inicia sesión
              </a>
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-card border border-card-border rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">
                    Resumen
                  </p>
                  <p className="font-bold text-foreground">{planName}</p>
                  <p className="text-xs text-muted font-medium">Acceso mensual a todos los cursos</p>
                </div>
                <p className="text-3xl font-black text-accent tracking-tighter">
                  ${price}
                  <span className="text-sm font-bold text-muted tracking-normal"> /mes</span>
                </p>
              </div>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent-subtle rounded-2xl flex items-center justify-center">
                  <Building2 size={18} className="text-accent" />
                </div>
                <div>
                  <p className="font-black text-foreground text-sm">Transferencia Bancaria</p>
                  <p className="text-xs text-muted font-medium">Realiza el pago a esta cuenta</p>
                </div>
              </div>

              {bankLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-accent" />
                </div>
              ) : bankConfig ? (
                <div className="space-y-3 mb-6">
                  {[
                    { label: "Banco", value: bankConfig.bankName },
                    { label: "Titular", value: bankConfig.accountName },
                    { label: "Número de Cuenta", value: bankConfig.accountNumber },
                    { label: "Routing (ABA)", value: bankConfig.routingNumber },
                    { label: "Tipo de Cuenta", value: bankConfig.accountType },
                  ].filter((r) => r.value).map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between bg-background rounded-xl px-4 py-3 border border-card-border"
                    >
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-0.5">
                          {row.label}
                        </p>
                        <p className="text-sm font-bold text-foreground font-mono">{row.value}</p>
                      </div>
                      <CopyButton text={row.value!} />
                    </div>
                  ))}
                  {bankConfig.instructions && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
                        Instrucciones
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                        {bankConfig.instructions}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-section-alt rounded-2xl p-4 mb-6 text-center">
                  <p className="text-sm text-muted font-medium">
                    Los datos bancarios serán configurados por el administrador en breve.
                    Contáctanos para recibir la información de pago.
                  </p>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
                    Número de Referencia / ID de Transacción
                  </label>
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ej. 1234567890"
                    className="w-full bg-background border border-card-border rounded-2xl py-4 px-4 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium font-mono"
                  />
                  <p className="text-[10px] text-muted mt-1.5 ml-1 font-medium">
                    Ingresa el número de confirmación que te proporcionó tu banco.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
                    Comprobante de Pago
                  </label>
                  {receiptImage ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check size={16} />
                        <span className="text-sm font-bold">Comprobante subido</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <a
                          href={receiptImage}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-accent font-bold hover:underline flex items-center gap-1"
                        >
                          <ImageIcon size={12} /> Ver
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setReceiptImage(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="text-xs text-muted hover:text-red-500 font-bold"
                        >
                          Cambiar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-card-border rounded-2xl p-6 cursor-pointer hover:border-accent hover:bg-accent-subtle transition-all">
                      {uploadingReceipt ? (
                        <Loader2 size={22} className="animate-spin text-accent" />
                      ) : (
                        <Upload size={22} className="text-muted" />
                      )}
                      <span className="text-sm font-bold text-muted">
                        {uploadingReceipt ? "Subiendo..." : "Haz clic para subir tu comprobante"}
                      </span>
                      <span className="text-[10px] text-muted font-medium">PNG, JPG, WEBP</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingReceipt}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleReceiptUpload(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || uploadingReceipt || !reference.trim()}
                  className="w-full bg-navy dark:bg-accent text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {loading ? "Enviando..." : "Confirmar Pago"}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-xs text-muted mt-4">
                <Shield size={13} />
                Tu información es segura y privada.
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-card border border-card-border rounded-xl p-10 text-center shadow-xl">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-amber-100 dark:bg-amber-950/30 rounded-full animate-pulse" />
              <div className="relative w-20 h-20 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center">
                <Clock className="text-amber-500" size={36} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3 tracking-tighter">
              ¡Comprobante recibido!
            </h2>
            <p className="text-muted font-medium leading-relaxed mb-2">
              Por favor espera mientras revisamos y aprobamos tu membresía.
            </p>
            <p className="text-xs text-muted mb-8 font-medium">
              Te notificaremos por email cuando tu acceso esté activo.
            </p>

            <div className="bg-section-alt rounded-2xl p-4 mb-8 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-2">
                Referencia enviada
              </p>
              <p className="font-bold text-foreground font-mono text-sm">{reference}</p>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <Loader2 size={13} className="animate-spin" />
              En espera de aprobación...
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
