"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  User, Mail, Lock, ArrowRight, Loader2,
  Building2, Copy, Check, Shield, CheckCircle,
  Upload, ImageIcon, Smartphone, Zap,
  QrCode, Maximize2, X, AlertCircle, Phone, BookOpen,
  ArrowLeft, Tag, MapPin, Calendar, Clock, Sparkles,
} from "lucide-react";
import { registerUser } from "@/lib/actions/auth";
import { createCourseInscription, type PaymentMethod } from "@/lib/actions/inscription";
import { validateCoupon, type CouponResult } from "@/lib/actions/coupons";
import type { WorkshopDetails } from "@/lib/utils/workshop";
import PageHero from "@/components/PageHero";

type GatewayItem = {
  provider: string;
  config: Record<string, string>;
};

type Step = 1 | 2 | 3;

interface CourseProps {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string | null;
  category: string;
  totalHours: number;
  totalClasses: number;
  instructorName: string;
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
              {isDone ? <Check size={12} /> : s.num}
            </div>
            <span
              className={`text-xs font-bold ${
                isCurrent ? "text-foreground" : "text-muted"
              }`}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 rounded-full transition-colors ${
                  step > s.num ? "bg-green-500" : "bg-card-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-colors"
      title="Copiar"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

export default function CheckoutCurso({
  course,
  workshopInfo,
  initialLoggedIn = false,
  initialName = "",
  initialEmail = "",
}: {
  course: CourseProps;
  workshopInfo?: WorkshopDetails;
  initialLoggedIn?: boolean;
  initialName?: string;
  initialEmail?: string;
}) {
  const [step, setStep] = useState<Step>(initialLoggedIn ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gateway state
  const [gateways, setGateways] = useState<GatewayItem[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string>("PAGO_MOVIL");

  // Payment form state
  const [reference, setReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // BCV State
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [bcvDate, setBcvDate] = useState<string | null>(null);
  const [bcvLoading, setBcvLoading] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Zoom QR
  const [zoomQrUrl, setZoomQrUrl] = useState<string | null>(null);

  const isWorkshop = workshopInfo?.isWorkshop ?? /workshop|taller|presencial/i.test(course.title);
  const effectivePrice = appliedCoupon ? appliedCoupon.finalAmount : course.price;

  // Fetch active gateways
  useEffect(() => {
    async function loadGateways() {
      try {
        const res = await fetch("/api/gateways");
        if (res.ok) {
          const data = await res.json();
          const active = data.gateways || [];
          setGateways(active);

          const order = ["PAGO_MOVIL", "ZELLE", "BINANCE", "BANK_TRANSFER"];
          const first = order.find((k) => active.some((g: any) => g.provider === k));
          if (first) setSelectedMethod(first);
        }
      } catch (err) {
        console.error("Error loading payment gateways:", err);
      } finally {
        setGatewaysLoading(false);
      }
    }
    loadGateways();
  }, []);

  // Fetch BCV Rate
  useEffect(() => {
    async function loadBcv() {
      setBcvLoading(true);
      try {
        const res = await fetch("/api/bcv");
        if (res.ok) {
          const data = await res.json();
          if (data.rate) {
            setBcvRate(data.rate);
            setBcvDate(data.date || null);
          }
        }
      } catch (err) {
        console.error("Error loading BCV rate:", err);
      } finally {
        setBcvLoading(false);
      }
    }
    loadBcv();
  }, []);

  const activeGateway = gateways.find((g) => g.provider === selectedMethod);
  const config = activeGateway?.config || {};

  const gatewayRate = config.bcvRate ? parseFloat(config.bcvRate) : null;
  const effectiveBcvRate = gatewayRate && gatewayRate > 0 ? gatewayRate : bcvRate;
  const totalBolivares = effectiveBcvRate ? Math.round(effectivePrice * effectiveBcvRate * 100) / 100 : null;

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);

    const res = await validateCoupon(couponInput.trim(), course.price);
    setCouponLoading(false);

    if (res.valid) {
      setAppliedCoupon(res);
      setCouponMessage({
        text: `¡Cupón ${res.code} aplicado! Ahorras $${res.discountAmount} USD (${res.discountPercent}% OFF).`,
        success: true,
      });
    } else {
      setAppliedCoupon(null);
      setCouponMessage({
        text: res.message || "Cupón no válido.",
        success: false,
      });
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

      const res = await fetch("/api/cloudflare/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error al subir comprobante");
      }

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

    const result = await createCourseInscription({
      cursoId: course.id,
      method: selectedMethod as PaymentMethod,
      reference: reference.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      amountPaid: effectivePrice,
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
      {/* Hero */}
      <PageHero
        backHref={`/cursos/${course.id}`}
        backLabel="Volver al Detalle"
        badge={
          <div className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 w-fit mx-auto text-xs font-semibold text-white/90">
            <BookOpen size={16} className="text-pink-200" />
            <span>{isWorkshop ? "Workshop Presencial" : "Curso Online"}</span>
          </div>
        }
        title={
          step === 1
            ? "Crea tu cuenta para inscribirte"
            : step === 2
            ? "Finaliza tu inscripción individual"
            : "¡Comprobante de inscripción recibido!"
        }
        subtitle={course.title}
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
              <a href={`/iniciar-sesion?callbackUrl=/pagar/curso/${course.id}`} className="text-accent font-bold hover:underline">
                Inicia sesión aquí
              </a>
            </p>
          </div>
        )}

        {/* STEP 2: PAYMENT WITH MANUAL VERIFICATION */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Course Summary Card with Workshop Logistics */}
            <div className="bg-card border border-card-border rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <span className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md inline-block mb-1.5 ${
                    isWorkshop
                      ? "bg-accent/15 text-accent border border-accent/30"
                      : "bg-accent/10 text-accent border border-accent/20"
                  }`}>
                    {isWorkshop ? "Workshop Presencial" : "Curso Online"}
                  </span>
                  <p className="font-bold text-foreground text-lg leading-tight">{course.title}</p>
                  
                  {isWorkshop ? (
                    <div className="mt-2.5 space-y-1 text-xs text-muted">
                      <div className="flex items-center gap-1.5 text-foreground font-semibold">
                        <MapPin size={13} className="text-accent shrink-0" />
                        <span>{workshopInfo?.location || "Caracas, Las Mercedes — Sede Ana's Pastry Shop"}</span>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] pt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-accent" />
                          {workshopInfo?.workshopDate || "Próxima fecha"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-accent" />
                          {workshopInfo?.workshopTime || "09:00 AM — 05:00 PM"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted font-medium mt-1">
                      {course.totalHours}h de contenido · Módulos y lecciones en video · Acceso permanente
                    </p>
                  )}
                </div>

                <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-card-border">
                  {appliedCoupon ? (
                    <div>
                      <span className="text-xs text-muted line-through mr-2 font-bold font-mono">${course.price}</span>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                        ${appliedCoupon.finalAmount}
                      </p>
                      <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                        -{appliedCoupon.discountPercent}% con cupón
                      </span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl font-black text-accent tracking-tight font-mono">
                        ${course.price}
                      </p>
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                        USD · Pago Único
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Promotional Coupon Card */}
            <div className="bg-card border border-card-border rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-accent" />
                  <span className="text-xs font-black uppercase tracking-wider text-foreground">
                    Cupón de Promoción
                  </span>
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

            {/* Payment Method Selector Tabs */}
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

            {/* Gateway Details Card */}
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
                <>
                  {/* PAGO MÓVIL (DÓLARES CON TASA BCV) */}
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
                                  : "Calculando..."}
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
                          <div className="relative group cursor-pointer" onClick={() => setZoomQrUrl(config.qrImage)}>
                            <div className="w-36 h-36 bg-white p-2 rounded-xl border border-purple-100 shadow-sm flex items-center justify-center">
                              <img
                                src={config.qrImage}
                                alt="Código QR Zelle"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Maximize2 size={14} /> Ampliar
                            </div>
                          </div>
                          <div className="text-center sm:text-left space-y-1">
                            <p className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                              Escaneo Rápido
                            </p>
                            <p className="text-xs text-muted max-w-[200px]">
                              Abre tu app bancaria y escanea el QR directamente para evitar errores.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2.5">
                        {[
                          { label: "Correo Zelle", value: config.email },
                          { label: "Titular", value: config.holderName },
                          { label: "Monto Exacto", value: `$${effectivePrice}.00 USD` },
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
                            <h3 className="font-black text-foreground text-base">Binance Pay (Cero Comisión)</h3>
                            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                              USDT
                            </span>
                          </div>
                          <p className="text-xs text-muted font-medium">
                            Envía USDT instantáneamente escaneando el código QR o con el Pay ID
                          </p>
                        </div>
                      </div>

                      {config.qrImage && (
                        <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-center gap-6">
                          <div className="relative group cursor-pointer" onClick={() => setZoomQrUrl(config.qrImage)}>
                            <div className="w-36 h-36 bg-white p-2 rounded-xl border border-amber-100 shadow-sm flex items-center justify-center">
                              <img
                                src={config.qrImage}
                                alt="Código QR Binance Pay"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                              <Maximize2 size={14} /> Ampliar
                            </div>
                          </div>
                          <div className="text-center sm:text-left space-y-1">
                            <p className="text-xs font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                              Escanea con tu Binance App
                            </p>
                            <p className="text-xs text-muted max-w-[200px]">
                              Abre Binance &gt; Escanear QR para realizar el envío directo sin comisión de red.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2.5">
                        {[
                          { label: "Binance Pay ID", value: config.payId },
                          { label: "Binance UID", value: config.binanceId },
                          { label: "Correo / Teléfono", value: config.email },
                          { label: "Monto Exacto", value: `${effectivePrice}.00 USDT` },
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
                          { label: "Monto", value: `$${effectivePrice}.00 USD` },
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
                        Captura o Comprobante de Pago
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
                      disabled={loading || uploadingReceipt || !reference.trim() || !receiptImage}
                      className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25 pt-4"
                    >
                      {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                      {loading ? "Enviando para revisión..." : isWorkshop ? "Confirmar e Inscribirme al Workshop" : "Confirmar Pago del Curso Online"}
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
              Hemos registrado tu pago para <strong>{course.title}</strong>.
            </p>
            <p className="text-xs text-muted mb-8 font-medium">
              Nuestro equipo verificará tu comprobante y habilitará tu acceso al curso y sus módulos en el panel de alumno.
            </p>

            <div className="bg-section-alt rounded-2xl p-5 mb-8 text-left space-y-2 border border-card-border">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Programa:</span>
                <span className="font-bold text-foreground truncate max-w-[200px]">{course.title}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted font-medium">Modalidad:</span>
                <span className="font-bold text-foreground">{isWorkshop ? "Workshop Presencial" : "Curso Online"}</span>
              </div>
              {isWorkshop && workshopInfo?.location && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted font-medium">Ubicación:</span>
                  <span className="font-bold text-foreground truncate max-w-[200px]">{workshopInfo.location}</span>
                </div>
              )}
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
                href={`/dashboard/cursos/${course.id}`}
                className="flex-1 bg-accent text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-accent-hover transition-all shadow-md shadow-pink-600/20 text-center"
              >
                Ver Contenido en el Dashboard
              </Link>
              <Link
                href="/dashboard/mis-cursos"
                className="flex-1 bg-card border border-card-border text-foreground hover:bg-card-hover py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all text-center"
              >
                Mis Cursos & Workshops
              </Link>
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
              <img
                src={zoomQrUrl}
                alt="Código QR Ampliado"
                className="w-64 h-64 object-contain"
              />
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
