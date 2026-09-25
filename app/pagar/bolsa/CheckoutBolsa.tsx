"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  User, Mail, Lock, ArrowRight, Loader2,
  Shield, CheckCircle, AlertCircle, BookOpen,
  ArrowLeft, Tag, X, ShoppingBag, Smartphone, Zap, QrCode, Building2,
} from "lucide-react";
import { registerUser } from "@/lib/actions/auth";
import {
  createBulkCourseInscriptions,
  type PaymentMethod,
} from "@/lib/actions/inscription";
import { validateCoupon, type CouponResult } from "@/lib/actions/coupons";
import GatewayDetails from "./GatewayDetails";
import PageHero from "@/components/PageHero";

type GatewayItem = {
  provider: string;
  config: Record<string, string>;
};

type Step = 1 | 2 | 3;

export interface BagCourse {
  id: string;
  title: string;
  price: number;
  image?: string | null;
  isWorkshop: boolean;
}

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

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function distributeAmounts(prices: number[], finalTotal: number): number[] {
  const rawTotal = prices.reduce((a, b) => a + b, 0);
  if (finalTotal >= rawTotal || prices.length === 0) {
    return prices.map((p) => round2(p));
  }
  const scale = finalTotal / rawTotal;
  const amounts = prices.map((p) => round2(p * scale));
  const diff = round2(finalTotal - amounts.reduce((a, b) => a + b, 0));
  amounts[amounts.length - 1] = round2(amounts[amounts.length - 1] + diff);
  return amounts;
}

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { num: 1, label: "Crear Cuenta" },
    { num: 2, label: "Realizar Pago" },
    { num: 3, label: "Confirmación" },
  ];

  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {steps.map((s, idx) => {
        const isDone = step > s.num;
        const isCurrent = step === s.num;
        return (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                isDone
                  ? "bg-green-500 text-white"
                  : isCurrent
                  ? "bg-accent text-white shadow-md shadow-pink-600/30"
                  : "bg-section-alt text-muted"
              }`}
            >
              {isDone ? "✓" : s.num}
            </div>
            <span className={`text-xs font-bold ${isCurrent ? "text-foreground" : "text-muted"}`}>
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div className={`w-8 h-0.5 rounded-full transition-colors ${step > s.num ? "bg-green-500" : "bg-card-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutBolsa({
  courses,
  skippedApproved,
  initialLoggedIn = false,
}: {
  courses: BagCourse[];
  skippedApproved: number;
  initialLoggedIn?: boolean;
}) {
  const [step, setStep] = useState<Step>(initialLoggedIn ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [gateways, setGateways] = useState<GatewayItem[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("PAGO_MOVIL");

  const [reference, setReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [bcvDate, setBcvDate] = useState<string | null>(null);
  const [bcvLoading, setBcvLoading] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);

  const [zoomQrUrl, setZoomQrUrl] = useState<string | null>(null);

  const total = courses.reduce((acc, c) => acc + c.price, 0);
  const effectivePrice = appliedCoupon ? appliedCoupon.finalAmount : total;
  const payments = distributeAmounts(
    courses.map((c) => c.price),
    effectivePrice
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/gateways");
        if (res.ok) {
          const data = await res.json();
          const active = data.gateways || [];
          if (cancelled) return;
          setGateways(active);
          const order = ["PAGO_MOVIL", "ZELLE", "BINANCE", "BANK_TRANSFER"];
          const first = order.find((k) => active.some((g: any) => g.provider === k));
          if (first) setSelectedMethod(first);
        }
      } catch (err) {
        console.error("Error loading payment gateways:", err);
      } finally {
        if (!cancelled) setGatewaysLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setBcvLoading(true);
      try {
        const res = await fetch("/api/bcv");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.rate) {
            setBcvRate(data.rate);
            setBcvDate(data.date || null);
          }
        }
      } catch (err) {
        console.error("Error loading BCV rate:", err);
      } finally {
        if (!cancelled) setBcvLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeGateway = gateways.find((g) => g.provider === selectedMethod);
  const config = activeGateway?.config || {};

  const gatewayRate = config.bcvRate ? parseFloat(config.bcvRate) : null;
  const effectiveBcvRate = gatewayRate && gatewayRate > 0 ? gatewayRate : bcvRate;
  const totalBolivares = effectiveBcvRate ? round2(effectivePrice * effectiveBcvRate) : null;

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);

    const res = await validateCoupon(couponInput.trim(), total);
    setCouponLoading(false);

    if (res.valid) {
      setAppliedCoupon(res);
      setCouponMessage({
        text: `¡Cupón ${res.code} aplicado! Ahorras $${res.discountAmount} USD (${res.discountPercent}% OFF).`,
        success: true,
      });
    } else {
      setAppliedCoupon(null);
      setCouponMessage({ text: res.message || "Cupón no válido.", success: false });
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMessage(null);
  }

  async function handleReceiptUpload(file: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo no debe superar 5MB.");
      return;
    }
    setUploadingReceipt(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cloudflare/upload-image", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Error al subir comprobante");
      const data = await res.json();
      setReceiptImage(data.url);
    } catch (err: any) {
      setError(err.message || "Error al subir la imagen del comprobante.");
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

    const res = await registerUser(formData);
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", { email, password, redirect: false });
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

    if (!reference.trim()) {
      setError("Por favor ingresa el número de referencia o confirmación.");
      return;
    }
    if (selectedMethod === "PAGO_MOVIL" && !phoneNumber.trim()) {
      setError("Por favor ingresa el número de teléfono desde el que realizaste el Pago Móvil.");
      return;
    }
    if (!receiptImage) {
      setError("Por favor adjunta la captura o foto del comprobante de pago.");
      return;
    }

    setLoading(true);

    const result = await createBulkCourseInscriptions({
      items: courses.map((c, i) => ({ cursoId: c.id, amountPaid: payments[i] })),
      method: selectedMethod as PaymentMethod,
      reference: reference.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
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

  const itemsQuery = courses.map((c) => c.id).join(",");
  const submitLabel =
    appliedCoupon
      ? `Confirmar Pago ($${effectivePrice} USD)`
      : `Confirmar Pago de la Bolsa ($${effectivePrice} USD)`;

  return (
    <main id="main-content" className="min-h-screen bg-background pb-16">
      {/* Hero */}
      <PageHero
        backHref="/cursos"
        backLabel="Volver al Catálogo"
        badge={
          <div className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 w-fit mx-auto text-xs font-semibold text-white/90">
            <ShoppingBag size={16} className="text-pink-200" />
            <span>
              {courses.length} {courses.length === 1 ? "Formación" : "Formaciones"} en tu Bolsa
            </span>
          </div>
        }
        title={
          step === 1
            ? "Crea tu cuenta para inscribirte"
            : step === 2
            ? "Finaliza el pago de tu bolsa"
            : "¡Comprobante de inscripción recibido!"
        }
        subtitle="Cursos online y workshops presenciales seleccionados."
        className="mb-12"
      />

      <div className="max-w-xl mx-auto px-4">
        <StepIndicator step={step} />

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-red-100 dark:border-red-800 flex items-center justify-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {skippedApproved > 0 && (
          <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-green-200 dark:border-green-800 flex items-center justify-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>
              {skippedApproved} {skippedApproved === 1 ? "formación fue descartada" : "formaciones fueron descartadas"} de la bolsa porque ya tienes acceso activo.
            </span>
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
                    placeholder="Ej. María Pérez"
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
                    placeholder="tu@correo.com"
                    className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-white py-4 rounded-2xl font-bold hover:bg-accent-hover transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Continuar al Pago
              </button>
            </form>

            <p className="text-center text-xs text-muted mt-6 font-medium">
              ¿Ya tienes una cuenta registrada?{" "}
              <a
                href={`/iniciar-sesion?callbackUrl=${encodeURIComponent(`/pagar/bolsa?items=${itemsQuery}`)}`}
                className="text-accent font-bold hover:underline"
              >
                Inicia sesión aquí
              </a>
            </p>
          </div>
        )}

        {/* STEP 2: PAYMENT */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Bag Summary */}
            <div className="bg-card border border-card-border rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={16} className="text-accent" />
                  <span className="text-xs font-black uppercase tracking-wider text-foreground">
                    Resumen de tu Bolsa
                  </span>
                </div>
                <span className="text-[11px] font-bold text-accent">
                  {courses.length} {courses.length === 1 ? "formación" : "formaciones"}
                </span>
              </div>

              <div className="space-y-3">
                {courses.map((course) => (
                  <div key={course.id} className="flex items-center gap-3 rounded-2xl border border-card-border bg-background/50 p-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted/20 shrink-0">
                      <Image src={course.image || "/foto-1.webp"} alt={course.title} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[9px] font-black uppercase tracking-widest block mb-0.5 ${
                        course.isWorkshop ? "text-accent" : "text-purple-600 dark:text-purple-400"
                      }`}>
                        {course.isWorkshop ? "Workshop Presencial" : "Curso Online"}
                      </span>
                      <p className="text-xs font-bold text-foreground line-clamp-2 leading-snug">{course.title}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-foreground font-mono">${course.price}</p>
                      <span className="text-[10px] text-muted">USD</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-card-border">
                {appliedCoupon ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div>
                      <span className="text-xs text-muted line-through mr-2 font-bold font-mono">${total}</span>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                        -{appliedCoupon.discountPercent}% con cupón
                      </span>
                    </div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                      ${effectivePrice}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted">Total Bolsa</span>
                    <div className="text-right">
                      <p className="text-2xl font-black text-accent tracking-tight font-mono">${total}</p>
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                        USD · Pago Único
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-card border border-card-border rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-accent" />
                  <span className="text-xs font-black uppercase tracking-wider text-foreground">Cupón de Promoción</span>
                </div>
                {!appliedCoupon && (
                  <button
                    type="button"
                    onClick={() => setCouponInput("TODOSLOSCURSOS")}
                    className="text-[11px] font-bold text-accent hover:underline"
                  >
                    Usar TODOSLOSCURSOS
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Ingresa tu cupón..."
                  disabled={couponLoading || !!appliedCoupon}
                  className="flex-1 bg-background border border-card-border rounded-2xl px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider outline-none focus:border-accent text-foreground disabled:opacity-60"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-2xl text-xs font-bold transition-colors"
                  >
                    Quitar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-5 py-3 bg-accent hover:bg-accent-hover text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-pink-600/20"
                  >
                    {couponLoading ? "Validando..." : "Aplicar"}
                  </button>
                )}
              </div>

              {couponMessage && (
                <p className={`text-xs font-medium flex items-center gap-1.5 ${
                  couponMessage.success ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                }`}>
                  {couponMessage.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                  {couponMessage.text}
                </p>
              )}
            </div>

            {/* Method Selector */}
            {availableManual.length > 1 && (
              <div className="bg-card border border-card-border rounded-3xl p-2.5 shadow-sm">
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
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
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

            {/* Gateway Details */}
            <div className="bg-card border border-card-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              {gatewaysLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted gap-2">
                  <Loader2 size={28} className="animate-spin text-accent" />
                  <p className="text-xs font-bold">Cargando opciones de pago...</p>
                </div>
              ) : !activeGateway ? (
                <div className="bg-section-alt rounded-2xl p-6 text-center">
                  <p className="text-sm text-muted font-medium">
                    Los datos de pago están siendo actualizados por administración.
                    Por favor recarga la página o contáctanos directamente.
                  </p>
                </div>
              ) : (
                <GatewayDetails
                  selectedMethod={selectedMethod}
                  config={config}
                  effectivePrice={effectivePrice}
                  totalBolivares={totalBolivares}
                  effectiveBcvRate={effectiveBcvRate}
                  bcvLoading={bcvLoading}
                  bcvDate={bcvDate}
                  reference={reference}
                  onReference={setReference}
                  phoneNumber={phoneNumber}
                  onPhoneNumber={setPhoneNumber}
                  receiptImage={receiptImage}
                  onReceiptChange={setReceiptImage}
                  uploadingReceipt={uploadingReceipt}
                  onUpload={handleReceiptUpload}
                  loading={loading}
                  onSubmit={handlePaymentSubmit}
                  onZoomQr={setZoomQrUrl}
                  submitLabel={submitLabel}
                />
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-muted pt-1">
                <Shield size={13} />
                Verificación manual segura por el equipo de Ana&apos;s Pastry Shop.
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMATION */}
        {step === 3 && (
          <div className="bg-card border border-card-border rounded-3xl p-8 sm:p-10 text-center shadow-xl">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 dark:bg-green-950/30 rounded-full animate-pulse" />
              <div className="relative w-20 h-20 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={36} />
              </div>
            </div>
            <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">
              ¡Comprobante de inscripción recibido!
            </h2>
            <p className="text-muted font-medium leading-relaxed mb-2">
              Hemos registrado tu pago por{" "}
              <strong>
                {courses.length} {courses.length === 1 ? "formación" : "formaciones"}
              </strong>{" "}
              de tu bolsa.
            </p>
            <p className="text-xs text-muted mb-8 font-medium">
              Nuestro equipo verificará tu comprobante y habilitará tus accesos en el panel de alumno.
            </p>

            <div className="bg-section-alt rounded-2xl p-5 mb-8 text-left space-y-2 border border-card-border">
              {courses.map((course) => (
                <div key={course.id} className="flex justify-between items-center text-xs gap-3">
                  <span className="font-bold text-foreground truncate max-w-[200px]">{course.title}</span>
                  <span className="text-[10px] text-muted shrink-0">
                    {course.isWorkshop ? "Workshop" : "Curso"} · ${course.price}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center text-xs pt-2 border-t border-card-border">
                <span className="text-muted font-medium">Método:</span>
                <span className="font-bold text-foreground">
                  {MANUAL_PROVIDERS.find((p) => p.key === selectedMethod)?.label ?? selectedMethod}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Referencia:</span>
                <span className="font-mono font-bold text-foreground">{reference}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Monto Pagado:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  ${effectivePrice} USD {appliedCoupon && `(Cupón: ${appliedCoupon.code})`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Estado:</span>
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full text-[11px] uppercase">
                  Pendiente de verificación
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard/mis-cursos"
                className="flex-1 bg-accent text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-accent-hover transition-all shadow-md shadow-pink-600/20 text-center"
              >
                Mis Cursos & Workshops
              </Link>
              <Link
                href="/cursos"
                className="flex-1 bg-card border border-card-border text-foreground hover:bg-card-hover py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all text-center"
              >
                Seguir Explorando
              </Link>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted mt-6">
              <BookOpen size={12} /> El acceso se habilita en el panel una vez aprobado el pago.
            </div>
          </div>
        )}
      </div>

      {/* MODAL ZOOM QR */}
      {zoomQrUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomQrUrl(null)}
        >
          <div
            className="relative bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomQrUrl(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
            <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-4">
              Escanea para pagar
            </p>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-inner">
              <img src={zoomQrUrl} alt="Código QR Ampliado" className="w-64 h-64 object-contain" />
            </div>
            <p className="text-xs text-slate-500 font-medium mt-4 text-center">
              Abre la aplicación correspondiente en tu teléfono y escanea este código.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}