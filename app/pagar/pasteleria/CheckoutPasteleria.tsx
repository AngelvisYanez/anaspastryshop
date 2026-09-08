"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  User, Mail, Lock, ArrowRight, Loader2,
  Building2, Copy, Check, Shield, CheckCircle,
  Upload, ImageIcon, Smartphone, Zap,
  QrCode, Maximize2, X, AlertCircle, Phone, Sparkles,
  ArrowLeft,
} from "lucide-react";
import { registerUser } from "@/lib/actions/auth";
import { createPastryServicePayment, type PaymentMethod } from "@/lib/actions/inscription";

type GatewayItem = {
  provider: string;
  config: Record<string, string>;
};

type Step = 1 | 2 | 3;

const MANUAL_PROVIDERS: {
  key: string;
  label: string;
  badge: string;
  Icon: React.ElementType;
}[] = [
  { key: "PAGO_MOVIL", label: "Pago Móvil", badge: "Tasa BCV", Icon: Smartphone },
  { key: "ZELLE", label: "Zelle", badge: "Con QR", Icon: Zap },
  { key: "BINANCE", label: "Binance Pay", badge: "Con QR", Icon: QrCode },
  { key: "BANK_TRANSFER", label: "Transferencia", badge: "Bancaria", Icon: Building2 },
];

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Tu cuenta" },
    { n: 2, label: "Detalle y Pago" },
    { n: 3, label: "Confirmación" },
  ];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all ${
                step > s.n
                  ? "bg-green-500 text-white"
                  : step === s.n
                  ? "bg-[#1C0524] dark:bg-accent text-white scale-110 shadow-lg"
                  : "bg-card border border-card-border text-muted"
              }`}
            >
              {step > s.n ? <Check size={16} /> : s.n}
            </div>
            <span
              className={`text-[11px] font-bold mt-1.5 uppercase tracking-wider ${
                step === s.n ? "text-foreground" : "text-muted"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-14 sm:w-20 h-px mx-2 mb-5 transition-all ${
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
      className="p-1.5 rounded-lg hover:bg-card-hover text-muted hover:text-accent transition-colors"
      title="Copiar al portapapeles"
    >
      {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
    </button>
  );
}

export default function CheckoutPasteleria({
  initialLoggedIn,
  initialName,
  initialEmail,
}: {
  initialLoggedIn: boolean;
  initialName?: string | null;
  initialEmail?: string | null;
}) {
  const [step, setStep] = useState<Step>(initialLoggedIn ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pastry order inputs
  const [serviceDescription, setServiceDescription] = useState("");
  const [amountPaidStr, setAmountPaidStr] = useState("");

  // Gateways
  const [gateways, setGateways] = useState<GatewayItem[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("PAGO_MOVIL");

  // BCV Rate
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [bcvDate, setBcvDate] = useState<string | null>(null);
  const [bcvLoading, setBcvLoading] = useState(false);

  // Form inputs
  const [reference, setReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // QR Modal
  const [zoomQrUrl, setZoomQrUrl] = useState<string | null>(null);

  useEffect(() => {
    if (step === 2) {
      setGatewaysLoading(true);
      fetch("/api/gateways")
        .then((r) => r.json())
        .then((d) => {
          const list: GatewayItem[] = d.gateways ?? [];
          setGateways(list);
          const manualKeys = MANUAL_PROVIDERS.map((p) => p.key);
          const firstAvailable = list.find((g) => manualKeys.includes(g.provider));
          if (firstAvailable) {
            setSelectedMethod(firstAvailable.provider);
          }
        })
        .catch(() => {})
        .finally(() => setGatewaysLoading(false));

      setBcvLoading(true);
      fetch("/api/bcv")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.rate) {
            setBcvRate(d.rate);
            setBcvDate(d.date);
          }
        })
        .catch(() => {})
        .finally(() => setBcvLoading(false));
    }
  }, [step]);

  const activeGateway = gateways.find((g) => g.provider === selectedMethod);
  const config = activeGateway?.config ?? {};

  // Rate calculation for Pago Móvil
  const effectiveBcvRate = (() => {
    if (selectedMethod === "PAGO_MOVIL" && config.customBcvRate) {
      const custom = parseFloat(config.customBcvRate);
      if (!isNaN(custom) && custom > 0) return custom;
    }
    return bcvRate;
  })();

  const numAmount = parseFloat(amountPaidStr);
  const totalBolivares = (effectiveBcvRate && !isNaN(numAmount) && numAmount > 0)
    ? (numAmount * effectiveBcvRate)
    : null;

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
        setError(data.error || "Error al subir el comprobante. Intenta de nuevo.");
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

    if (!serviceDescription.trim()) {
      setError("Por favor describe el servicio de pastelería o pedido (ej. Torta de boda, mesa de dulces).");
      return;
    }

    const parsedAmount = parseFloat(amountPaidStr);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Por favor ingresa un monto válido en USD acorde a tu cotización acordada.");
      return;
    }

    if (!reference.trim()) {
      setError("Por favor ingresa el número de referencia o confirmación del pago.");
      return;
    }

    if (selectedMethod === "PAGO_MOVIL" && !phoneNumber.trim()) {
      setError("Por favor ingresa el número de teléfono emisor del Pago Móvil.");
      return;
    }

    if (!receiptImage) {
      setError("Por favor adjunta la captura o foto del comprobante de pago.");
      return;
    }

    setLoading(true);

    const result = await createPastryServicePayment({
      serviceDescription: serviceDescription.trim(),
      method: selectedMethod as PaymentMethod,
      reference: reference.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      amountPaid: parsedAmount,
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

  const availableManual = MANUAL_PROVIDERS.filter((mp) =>
    gateways.some((g) => g.provider === mp.key)
  );

  return (
    <main id="main-content" className="min-h-screen bg-background pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1C0524] to-[#2B0938] pt-28 pb-16 px-6 md:px-20 rounded-b-3xl mb-10 text-center">
        <div className="absolute inset-0 opacity-[0.03] noise-bg pointer-events-none" />
        <div className="relative z-10 max-w-xl mx-auto">
          <Link
            href="/pasteleria"
            className="inline-flex items-center gap-1.5 text-pink-300 hover:text-white text-xs font-bold uppercase tracking-widest mb-4 transition-colors"
          >
            <ArrowLeft size={14} /> Conoce Nuestros Servicios
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">
            {step === 1 && "Crea tu cuenta para reportar tu pago"}
            {step === 2 && "Detalle del Pedido & Pago"}
            {step === 3 && "Comprobante de Pedido Recibido"}
          </h1>
          <p className="text-xs md:text-sm text-white/60 font-medium max-w-md mx-auto">
            Reporta el comprobante de tu abono o pago de pastelería personalizada, tortas de diseño o catering dulce.
          </p>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4">
        <StepIndicator step={step} />

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-red-100 dark:border-red-800 flex items-center justify-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CREATE ACCOUNT */}
        {step === 1 && (
          <div className="bg-card border border-card-border rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Ej. Anais Flores"
                    className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
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
                <label className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
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
                className="w-full bg-accent text-white py-4 px-4 rounded-2xl font-bold hover:bg-accent-hover transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg mt-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                {loading ? "Creando cuenta..." : "Continuar al Pago del Pedido"}
              </button>
            </form>

            <p className="text-center text-xs text-muted mt-6">
              ¿Ya tienes cuenta?{" "}
              <a href="/iniciar-sesion?callbackUrl=/pagar/pasteleria" className="text-accent font-bold hover:underline">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        )}

        {/* STEP 2: PASTRY DETAILS & MANUAL PAYMENT */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Service & Amount Configuration Card */}
            <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles size={16} />
                <h2 className="text-xs font-black uppercase tracking-widest text-foreground">
                  Información de tu Pedido o Cotización
                </h2>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-muted block mb-1.5 ml-1">
                  Descripción o Concepto del Pedido
                </label>
                <input
                  type="text"
                  required
                  value={serviceDescription}
                  onChange={(e) => setServiceDescription(e.target.value)}
                  placeholder="Ej. Torta de Bodas 3 pisos sabor Red Velvet, Mesa de dulces 50 pers."
                  className="w-full bg-background border border-card-border rounded-2xl py-3.5 px-4 outline-none focus:border-accent text-foreground text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-muted block mb-1.5 ml-1">
                  Monto acordado a pagar (USD $)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-black text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amountPaidStr}
                    onChange={(e) => setAmountPaidStr(e.target.value)}
                    placeholder="Ej. 120.00"
                    className="w-full bg-background border border-card-border rounded-2xl py-3.5 pl-9 pr-14 outline-none focus:border-accent text-foreground text-base font-bold font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-black text-muted uppercase">
                    USD
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            {availableManual.length > 1 && (
              <div className="bg-card border border-card-border rounded-2xl p-2 shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-2 px-2 pt-1">
                  Selecciona tu método de pago
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {availableManual.map((m) => {
                    const { Icon } = m;
                    const isSelected = selectedMethod === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setSelectedMethod(m.key)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
                          isSelected
                            ? "bg-accent/10 border-accent text-accent shadow-sm"
                            : "bg-section-alt/50 border-transparent text-muted hover:border-card-border hover:text-foreground"
                        }`}
                      >
                        <Icon size={18} className="mb-1" />
                        <span className="text-xs font-bold leading-tight">{m.label}</span>
                        <span className="text-[9px] font-semibold opacity-70 mt-0.5">{m.badge}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gateway Details Card */}
            <div className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              {gatewaysLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted gap-2">
                  <Loader2 size={28} className="animate-spin text-accent" />
                  <p className="text-xs font-bold">Cargando opciones de pago...</p>
                </div>
              ) : !activeGateway ? (
                <div className="bg-section-alt rounded-2xl p-6 text-center">
                  <p className="text-sm text-muted font-medium">
                    Los datos de pago están siendo actualizados por administración.
                    Por favor contáctanos directamente para coordinar tu pago.
                  </p>
                </div>
              ) : (
                <>
                  {/* PAGO MÓVIL (BCV) */}
                  {selectedMethod === "PAGO_MOVIL" && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-foreground text-base">Pago Móvil (Tasa Oficial BCV)</h3>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                              BCV Oficial
                            </span>
                          </div>
                          <p className="text-xs text-muted font-medium">
                            Calculado al cambio oficial del Banco Central de Venezuela
                          </p>
                        </div>
                      </div>

                      {/* BCV Conversion Box */}
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
                                  : numAmount > 0
                                  ? "Calculando..."
                                  : "Ingresa el monto arriba"}
                              </p>
                              {totalBolivares !== null && (
                                <CopyButton text={totalBolivares.toFixed(2)} />
                              )}
                            </div>
                          </div>
                          <div className="bg-card/90 rounded-xl px-3.5 py-2 border border-card-border text-left sm:text-right shrink-0">
                            <p className="text-[11px] font-bold text-muted">Tasa BCV del día</p>
                            <p className="text-xs font-black text-foreground font-mono">
                              {effectiveBcvRate
                                ? `1 USD = Bs. ${effectiveBcvRate.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                : "Obteniendo..."}
                            </p>
                            {bcvDate && (
                              <p className="text-[9px] text-muted truncate max-w-[150px]">
                                Fecha: {new Date(bcvDate).toLocaleDateString("es-VE")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Account Info */}
                      <div className="space-y-2.5">
                        {[
                          { label: "Banco", value: config.bankName },
                          { label: "Teléfono Receptor", value: config.phoneNumber },
                          { label: "Cédula / RIF", value: config.idNumber },
                          { label: "Titular", value: config.holderName },
                        ].filter((r) => r.value).map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between bg-section-alt rounded-xl px-4 py-3 border border-card-border"
                          >
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-0.5">
                                {row.label}
                              </p>
                              <p className="text-sm font-bold text-foreground font-mono">{row.value}</p>
                            </div>
                            <CopyButton text={row.value!} />
                          </div>
                        ))}
                      </div>

                      {config.instructions && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">
                            Instrucciones
                          </p>
                          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                            {config.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ZELLE CON QR */}
                  {selectedMethod === "ZELLE" && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center shrink-0">
                          <Zap size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-foreground text-base">Zelle (con Código QR)</h3>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-purple-500/15 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                              Escaneo QR
                            </span>
                          </div>
                          <p className="text-xs text-muted font-medium">
                            Transfiere desde tu banca móvil escaneando el código QR o usando el correo
                          </p>
                        </div>
                      </div>

                      {config.qrImage && (
                        <div className="bg-purple-50/50 dark:bg-purple-950/10 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-center gap-6">
                          <div
                            className="relative group cursor-pointer bg-white p-3 rounded-2xl shadow-md border border-slate-200 shrink-0"
                            onClick={() => setZoomQrUrl(config.qrImage)}
                            title="Haz clic para ampliar"
                          >
                            <img
                              src={config.qrImage}
                              alt="Código QR Zelle"
                              className="w-36 h-36 object-contain"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Maximize2 size={16} /> Ampliar
                            </div>
                          </div>
                          <div className="text-center sm:text-left space-y-1">
                            <p className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
                              Escanea el QR de Zelle
                            </p>
                            <p className="text-xs text-muted font-medium max-w-[220px]">
                              Abre la app de tu banco, escanea el QR y transfiere{" "}
                              <strong>{numAmount > 0 ? `$${numAmount.toFixed(2)} USD` : "el monto acordado"}</strong>.
                            </p>
                            <button
                              type="button"
                              onClick={() => setZoomQrUrl(config.qrImage)}
                              className="text-xs font-bold text-accent hover:underline flex items-center gap-1 mx-auto sm:mx-0 pt-1"
                            >
                              <Maximize2 size={13} /> Ver QR en grande
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2.5">
                        {[
                          { label: "Correo de Zelle", value: config.email },
                          { label: "Titular", value: config.holderName },
                          { label: "Monto a Transferir", value: numAmount > 0 ? `$${numAmount.toFixed(2)} USD` : undefined },
                        ].filter((r) => r.value).map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between bg-section-alt rounded-xl px-4 py-3 border border-card-border"
                          >
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-0.5">
                                {row.label}
                              </p>
                              <p className="text-sm font-bold text-foreground font-mono">{row.value}</p>
                            </div>
                            <CopyButton text={row.value!} />
                          </div>
                        ))}
                      </div>

                      {config.instructions && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">
                            Instrucciones
                          </p>
                          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                            {config.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BINANCE PAY CON QR */}
                  {selectedMethod === "BINANCE" && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
                          <QrCode size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-black text-foreground text-base">Binance Pay (con Código QR)</h3>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                              Cero Comisión
                            </span>
                          </div>
                          <p className="text-xs text-muted font-medium">
                            Paga en USDT mediante Binance Pay ID o escaneando el código QR
                          </p>
                        </div>
                      </div>

                      {config.qrImage && (
                        <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-center gap-6">
                          <div
                            className="relative group cursor-pointer bg-white p-3 rounded-2xl shadow-md border border-slate-200 shrink-0"
                            onClick={() => setZoomQrUrl(config.qrImage)}
                            title="Haz clic para ampliar"
                          >
                            <img
                              src={config.qrImage}
                              alt="Código QR Binance Pay"
                              className="w-36 h-36 object-contain"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Maximize2 size={16} /> Ampliar
                            </div>
                          </div>
                          <div className="text-center sm:text-left space-y-1">
                            <p className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                              Escanea el QR de Binance
                            </p>
                            <p className="text-xs text-muted font-medium max-w-[220px]">
                              Abre la app de Binance, pulsa <strong>Pay</strong> o <strong>Escanear</strong> y transfiere{" "}
                              <strong>{numAmount > 0 ? `${numAmount.toFixed(2)} USDT` : "el monto acordado"}</strong>.
                            </p>
                            <button
                              type="button"
                              onClick={() => setZoomQrUrl(config.qrImage)}
                              className="text-xs font-bold text-accent hover:underline flex items-center gap-1 mx-auto sm:mx-0 pt-1"
                            >
                              <Maximize2 size={13} /> Ver QR en grande
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2.5">
                        {[
                          { label: "Binance Pay ID", value: config.payId },
                          { label: "Binance UID", value: config.binanceId },
                          { label: "Correo / Teléfono", value: config.email },
                          { label: "Monto Exacto", value: numAmount > 0 ? `${numAmount.toFixed(2)} USDT` : undefined },
                        ].filter((r) => r.value).map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between bg-section-alt rounded-xl px-4 py-3 border border-card-border"
                          >
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-0.5">
                                {row.label}
                              </p>
                              <p className="text-sm font-bold text-foreground font-mono">{row.value}</p>
                            </div>
                            <CopyButton text={row.value!} />
                          </div>
                        ))}
                      </div>

                      {config.instructions && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">
                            Instrucciones
                          </p>
                          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                            {config.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TRANSFERENCIA BANCARIA */}
                  {selectedMethod === "BANK_TRANSFER" && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-subtle rounded-2xl flex items-center justify-center shrink-0">
                          <Building2 size={20} className="text-accent" />
                        </div>
                        <div>
                          <h3 className="font-black text-foreground text-base">Transferencia Bancaria</h3>
                          <p className="text-xs text-muted font-medium">Realiza el pago a esta cuenta bancaria</p>
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          { label: "Banco", value: config.bankName },
                          { label: "Titular", value: config.accountName },
                          { label: "Número de Cuenta", value: config.accountNumber },
                          { label: "Routing (ABA)", value: config.routingNumber },
                          { label: "Tipo de Cuenta", value: config.accountType },
                        ].filter((r) => r.value).map((row) => (
                          <div
                            key={row.label}
                            className="flex items-center justify-between bg-section-alt rounded-xl px-4 py-3 border border-card-border"
                          >
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-0.5">
                                {row.label}
                              </p>
                              <p className="text-sm font-bold text-foreground font-mono">{row.value}</p>
                            </div>
                            <CopyButton text={row.value!} />
                          </div>
                        ))}
                      </div>

                      {config.instructions && (
                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-0.5">
                            Instrucciones
                          </p>
                          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                            {config.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* FORM TO ENTER REFERENCE AND UPLOAD COMPROBANTE */}
                  <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-4 border-t border-card-border">
                    {selectedMethod === "PAGO_MOVIL" && (
                      <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
                          Teléfono desde el que pagaste
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                          <input
                            type="tel"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Ej. 0414-1234567"
                            className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
                        {selectedMethod === "BINANCE"
                          ? "Binance Order ID / ID de Transacción"
                          : selectedMethod === "PAGO_MOVIL"
                          ? "Número de Referencia (4 a 8 dígitos)"
                          : "Número de Referencia / ID de Confirmación"}
                      </label>
                      <input
                        type="text"
                        required
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder={
                          selectedMethod === "BINANCE"
                            ? "Ej. 2039481726"
                            : selectedMethod === "PAGO_MOVIL"
                            ? "Ej. 123456"
                            : "Ej. 987654321"
                        }
                        className="w-full bg-background border border-card-border rounded-2xl py-4 px-4 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
                        Captura o Comprobante del Pago
                      </label>
                      {receiptImage ? (
                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <Check size={16} />
                            <span className="text-sm font-bold">Comprobante adjuntado</span>
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
                            <Loader2 size={24} className="animate-spin text-accent" />
                          ) : (
                            <Upload size={24} className="text-muted" />
                          )}
                          <span className="text-sm font-bold text-foreground">
                            {uploadingReceipt ? "Subiendo comprobante..." : "Haz clic para subir tu comprobante"}
                          </span>
                          <span className="text-[11px] text-muted font-medium">
                            Captura de pantalla o recibo (PNG, JPG, WEBP · Máx. 5MB)
                          </span>
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
                      disabled={loading || uploadingReceipt || !reference.trim() || !receiptImage || !serviceDescription.trim() || isNaN(numAmount) || numAmount <= 0}
                      className="w-full bg-[#1C0524] text-white py-4 px-4 rounded-2xl font-bold hover:bg-accent transition-all disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                      {loading ? "Enviando para revisión..." : "Confirmar Reporte de Pago de Pastelería"}
                    </button>
                  </form>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted pt-1">
                    <Shield size={13} />
                    Verificación manual segura por el equipo de Ana&apos;s Pastry Shop.
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMATION */}
        {step === 3 && (
          <div className="bg-card border border-card-border rounded-2xl p-8 sm:p-10 text-center shadow-xl">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 dark:bg-green-950/30 rounded-full animate-pulse" />
              <div className="relative w-20 h-20 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={36} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3 tracking-tighter">
              ¡Comprobante de Pedido Recibido!
            </h2>
            <p className="text-muted font-medium leading-relaxed mb-2">
              Hemos recibido tu reporte de pago para el servicio de pastelería:
            </p>
            <p className="text-sm font-bold text-accent mb-4">
              &ldquo;{serviceDescription}&rdquo;
            </p>
            <p className="text-xs text-muted mb-8 font-medium">
              Anais y el equipo de Ana&apos;s Pastry Shop verificarán tu pago y se pondrán en contacto contigo para coordinar la entrega o preparación de tu pedido dulce.
            </p>

            <div className="bg-section-alt rounded-2xl p-5 mb-8 text-left space-y-2 border border-card-border">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Servicio:</span>
                <span className="font-bold text-foreground truncate max-w-[200px]">{serviceDescription}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Método:</span>
                <span className="font-bold text-foreground">
                  {MANUAL_PROVIDERS.find((p) => p.key === selectedMethod)?.label ?? selectedMethod}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Referencia:</span>
                <span className="font-mono font-bold text-foreground">{reference}</span>
              </div>
              {phoneNumber && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted font-medium">Teléfono emisor:</span>
                  <span className="font-mono font-bold text-foreground">{phoneNumber}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Monto reportado:</span>
                <span className="font-bold text-accent">${parseFloat(amountPaidStr || "0").toFixed(2)} USD</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/pasteleria"
                className="flex-1 bg-[#1C0524] text-white py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-accent transition-colors text-center"
              >
                Volver a Pastelería
              </Link>
              <Link
                href="/cursos"
                className="flex-1 bg-section-alt border border-card-border text-foreground py-3.5 px-5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-card-hover transition-colors text-center"
              >
                Explorar Workshops
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* QR ZOOM MODAL */}
      {zoomQrUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setZoomQrUrl(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomQrUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
              Escanea para pagar
            </p>
            <div className="w-64 h-64 bg-white flex items-center justify-center p-2 rounded-2xl border border-slate-100 shadow-inner">
              <img
                src={zoomQrUrl}
                alt="QR ampliado"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-xs text-slate-500 text-center font-medium mt-4">
              Abre la app de tu banco o Binance para escanear directamente este código.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
