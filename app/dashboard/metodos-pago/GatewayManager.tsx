"use client";

import { useState, useRef } from "react";
import {
  ChevronDown, Eye, EyeOff, Save, Loader2, CheckCircle,
  CreditCard, Zap, DollarSign, Building2, Smartphone, QrCode,
  Upload, Image as ImageIcon, X,
} from "lucide-react";
import { saveGatewayConfig } from "@/lib/actions/gateway";
import Image from "next/image";

type GatewayConfig = {
  provider: string;
  isEnabled: boolean;
  publicKey: string | null;
  secretKey: string | null;
  webhookSecret: string | null;
  extraConfig: Record<string, string> | null;
};

type GatewayDef = {
  provider: string;
  label: string;
  description: string;
  type: "automatic" | "manual";
  Icon: React.ElementType;
  color: string;
  fields: {
    key: string;
    label: string;
    placeholder: string;
    secret?: boolean;
    extra?: boolean;
    isImage?: boolean;
  }[];
};

const GATEWAYS: GatewayDef[] = [
  {
    provider: "STRIPE",
    label: "Stripe",
    description: "Pagos automáticos con tarjeta de crédito/débito.",
    type: "automatic",
    Icon: CreditCard,
    color: "indigo",
    fields: [
      { key: "publicKey", label: "Publishable Key", placeholder: "pk_live_..." },
      { key: "secretKey", label: "Secret Key", placeholder: "sk_live_...", secret: true },
      { key: "webhookSecret", label: "Webhook Secret", placeholder: "whsec_...", secret: true },
    ],
  },
  {
    provider: "PAYPAL",
    label: "PayPal",
    description: "Pagos automáticos vía PayPal Checkout.",
    type: "automatic",
    Icon: DollarSign,
    color: "blue",
    fields: [
      { key: "publicKey", label: "Client ID", placeholder: "AaB..." },
      { key: "secretKey", label: "Client Secret", placeholder: "EHN...", secret: true },
    ],
  },
  {
    provider: "PAGO_MOVIL",
    label: "Pago Móvil (en Dólares con tasa BCV)",
    description: "Pagos en bolívares calculados al cambio oficial BCV. Verificación manual por comprobante.",
    type: "manual",
    Icon: Smartphone,
    color: "emerald",
    fields: [
      { key: "bankName", label: "Nombre del Banco", placeholder: "Ej. Banesco / Banco de Venezuela / Mercantil", extra: true },
      { key: "phoneNumber", label: "Teléfono Pago Móvil", placeholder: "Ej. 0414-1234567", extra: true },
      { key: "idNumber", label: "Cédula o RIF", placeholder: "Ej. V-12345678 o J-12345678", extra: true },
      { key: "holderName", label: "Nombre del Titular", placeholder: "Ej. Ana Flores", extra: true },
      { key: "customBcvRate", label: "Tasa BCV Manual (Opcional - solo si deseas forzar una tasa en vez de la API)", placeholder: "Ej. 807.39", extra: true },
      { key: "instructions", label: "Instrucciones adicionales", placeholder: "Ej. Coloca tu número de cédula en el concepto y sube la captura legible.", extra: true },
    ],
  },
  {
    provider: "ZELLE",
    label: "Zelle (con QR)",
    description: "Transferencias vía Zelle con correo, titular y código QR. Verificación manual por comprobante.",
    type: "manual",
    Icon: Zap,
    color: "purple",
    fields: [
      { key: "email", label: "Email de Zelle", placeholder: "pagos@anaspastryshop.com", extra: true },
      { key: "holderName", label: "Nombre del Titular", placeholder: "Ana Flores", extra: true },
      { key: "qrImage", label: "Código QR de Zelle (Sube tu imagen o pega una URL)", placeholder: "https://... o sube el archivo", extra: true, isImage: true },
      { key: "instructions", label: "Instrucciones adicionales", placeholder: "Ej. Incluir tu nombre en la nota de Zelle.", extra: true },
    ],
  },
  {
    provider: "BINANCE",
    label: "Binance Pay (con QR)",
    description: "Pagos en USDT vía Binance Pay con Pay ID y código QR. Verificación manual por comprobante.",
    type: "manual",
    Icon: QrCode,
    color: "yellow",
    fields: [
      { key: "payId", label: "Binance Pay ID", placeholder: "Ej. 293849102", extra: true },
      { key: "binanceId", label: "Binance UID / ID de Usuario (opcional)", placeholder: "Ej. 18273645", extra: true },
      { key: "email", label: "Correo / Teléfono de Binance (opcional)", placeholder: "pagos@anaspastryshop.com", extra: true },
      { key: "qrImage", label: "Código QR de Binance Pay (Sube tu imagen o pega una URL)", placeholder: "https://... o sube el archivo", extra: true, isImage: true },
      { key: "instructions", label: "Instrucciones adicionales", placeholder: "Ej. Enviar el monto exacto en USDT y adjuntar la captura del comprobante.", extra: true },
    ],
  },
  {
    provider: "BANK_TRANSFER",
    label: "Transferencia Bancaria (ACH/Wire)",
    description: "Transferencia bancaria internacional o local. Los datos se muestran al usuario al pagar.",
    type: "manual",
    Icon: Building2,
    color: "slate",
    fields: [
      { key: "bankName", label: "Nombre del Banco", placeholder: "Bank of America / Chase", extra: true },
      { key: "accountName", label: "Titular de la Cuenta", placeholder: "Ana Flores LLC", extra: true },
      { key: "accountNumber", label: "Número de Cuenta", placeholder: "123456789", extra: true },
      { key: "routingNumber", label: "Routing Number (ABA)", placeholder: "021000021", extra: true },
      { key: "accountType", label: "Tipo de Cuenta", placeholder: "Checking / Ahorros", extra: true },
      { key: "instructions", label: "Instrucciones adicionales", placeholder: "Incluir nombre completo en el memo", extra: true },
    ],
  },
];

const COLOR_MAP: Record<string, string> = {
  indigo: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800",
  blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  yellow: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  slate: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700",
};

type FormState = {
  isEnabled: boolean;
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  extra: Record<string, string>;
};

function buildInitialState(def: GatewayDef, cfg?: GatewayConfig): FormState {
  const extraFields = def.fields.filter((f) => f.extra);
  const extra: Record<string, string> = {};
  for (const f of extraFields) {
    extra[f.key] = (cfg?.extraConfig as any)?.[f.key] ?? "";
  }
  return {
    isEnabled: cfg?.isEnabled ?? false,
    publicKey: cfg?.publicKey ?? "",
    secretKey: cfg?.secretKey ?? "",
    webhookSecret: cfg?.webhookSecret ?? "",
    extra,
  };
}

function GatewayCard({
  def,
  initialConfig,
}: {
  def: GatewayDef;
  initialConfig?: GatewayConfig;
}) {
  const [form, setForm] = useState<FormState>(() => buildInitialState(def, initialConfig));
  const [open, setOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadKey, setActiveUploadKey] = useState<string | null>(null);

  const colorClass = COLOR_MAP[def.color] ?? COLOR_MAP.indigo;
  const { Icon } = def;

  function toggleSecret(key: string) {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function setField(key: string, value: string, isExtra = false) {
    if (isExtra) {
      setForm((f) => ({ ...f, extra: { ...f.extra, [key]: value } }));
    } else {
      setForm((f) => ({ ...f, [key as keyof FormState]: value } as FormState));
    }
  }

  async function handleImageUpload(fieldKey: string, file: File) {
    setUploadingField(fieldKey);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cloudflare/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setField(fieldKey, data.url, true);
      } else {
        setError(data.error || "Error al subir la imagen");
      }
    } catch {
      setError("Error al subir la imagen. Intenta de nuevo.");
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await saveGatewayConfig(def.provider, {
      isEnabled: form.isEnabled,
      publicKey: form.publicKey || undefined,
      secretKey: form.secretKey || undefined,
      webhookSecret: form.webhookSecret || undefined,
      extraConfig: Object.keys(form.extra).length > 0 ? form.extra : undefined,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-card-border shadow-sm overflow-hidden transition-all">
      <div
        role="button"
        tabIndex={0}
        className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 cursor-pointer hover:bg-card-hover transition-colors"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${colorClass}`}>
            <Icon size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <p className="font-bold text-foreground text-sm sm:text-base">{def.label}</p>
              <span
                className={`text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                  def.type === "automatic"
                    ? "bg-accent/10 text-accent"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {def.type === "automatic" ? "Automático" : "Comprobante"}
              </span>
            </div>
            <p className="text-xs text-muted font-medium mt-0.5">{def.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setForm((f) => ({ ...f, isEnabled: !f.isEnabled }));
            }}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              form.isEnabled ? "bg-accent" : "bg-muted/25"
            }`}
            title={form.isEnabled ? "Desactivar" : "Activar"}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                form.isEnabled ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
          <ChevronDown
            size={18}
            className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {open && (
        <div className="px-4 sm:px-8 pb-6 sm:pb-8 border-t border-card-border pt-6 bg-section-alt/40 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-500 p-3.5 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {def.fields.map((field) => {
            const isSecret = field.secret;
            const isExtra = field.extra;
            const value = isExtra ? form.extra[field.key] ?? "" : (form as any)[field.key] ?? "";
            const visible = showSecrets[field.key];
            const isImage = field.isImage;

            return (
              <div key={field.key} className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">{field.label}</label>

                {isImage ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => setField(field.key, e.target.value, isExtra)}
                        placeholder={field.placeholder}
                        className="flex-1 bg-card border border-card-border rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:border-accent transition-all font-mono text-foreground placeholder:font-sans placeholder:text-muted"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        id={`file-${def.provider}-${field.key}`}
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(field.key, file);
                        }}
                      />
                      <label
                        htmlFor={`file-${def.provider}-${field.key}`}
                        className="flex items-center gap-2 bg-card border border-card-border hover:border-accent text-foreground px-4 py-3 rounded-xl cursor-pointer text-xs font-bold transition-all shrink-0"
                      >
                        {uploadingField === field.key ? (
                          <Loader2 size={16} className="animate-spin text-accent" />
                        ) : (
                          <Upload size={16} className="text-accent" />
                        )}
                        <span>{uploadingField === field.key ? "Subiendo..." : "Subir QR"}</span>
                      </label>
                    </div>

                    {value && (
                      <div className="flex items-center gap-3 p-3 bg-card rounded-xl border border-card-border w-fit">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-card-border bg-white flex items-center justify-center">
                          <img
                            src={value}
                            alt="Vista previa QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-foreground">Vista previa del QR</p>
                          <p className="text-[11px] text-muted">Este QR se mostrará en el checkout</p>
                          <button
                            type="button"
                            onClick={() => setField(field.key, "", isExtra)}
                            className="text-red-500 hover:underline text-[11px] font-bold mt-1 flex items-center gap-1"
                          >
                            <X size={12} /> Quitar imagen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type={isSecret && !visible ? "password" : "text"}
                      value={value}
                      onChange={(e) => setField(field.key, e.target.value, isExtra)}
                      placeholder={field.placeholder}
                      className="flex-1 bg-card border border-card-border rounded-xl px-4 py-3 text-sm outline-none focus:border-accent transition-all font-mono text-foreground placeholder:font-sans placeholder:text-muted"
                    />
                    {isSecret && (
                      <button
                        type="button"
                        onClick={() => toggleSecret(field.key)}
                        className="px-4 bg-card border border-card-border rounded-xl text-muted hover:text-accent transition-colors"
                      >
                        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-2">
            {saved && (
              <span className="flex items-center gap-2 text-emerald-600 text-xs font-bold">
                <CheckCircle size={15} /> Guardado correctamente
              </span>
            )}
            {!saved && <span />}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-accent-hover shadow-md shadow-accent/20 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GatewayManager({ configs }: { configs: GatewayConfig[] }) {
  const configMap = Object.fromEntries(configs.map((c) => [c.provider, c]));

  const automatic = GATEWAYS.filter((g) => g.type === "automatic");
  const manual = GATEWAYS.filter((g) => g.type === "manual");

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <h2 className="text-xl font-black text-foreground">Métodos de Pago</h2>
        <p className="text-muted text-sm font-medium mt-1">
          Configura tus cuentas para pagos manuales por verificación de comprobante (Pago Móvil con tasa BCV, Zelle con QR, Binance Pay con QR) y pasarelas automáticas.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-4 ml-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="text-xs font-black uppercase tracking-widest text-muted">
              Métodos Manuales con Verificación de Comprobante
            </p>
          </div>
          <div className="space-y-4">
            {manual.map((def) => (
              <GatewayCard key={def.provider} def={def} initialConfig={configMap[def.provider]} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4 ml-1">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <p className="text-xs font-black uppercase tracking-widest text-muted">
              Pasarelas Automáticas
            </p>
          </div>
          <div className="space-y-4">
            {automatic.map((def) => (
              <GatewayCard key={def.provider} def={def} initialConfig={configMap[def.provider]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
