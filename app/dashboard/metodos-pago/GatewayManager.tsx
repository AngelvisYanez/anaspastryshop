"use client";

import { useState } from "react";
import {
  ChevronDown, Eye, EyeOff, Save, Loader2, CheckCircle,
  CreditCard, Zap, DollarSign, Building2,
} from "lucide-react";
import { saveGatewayConfig } from "@/lib/actions/gateway";

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
    provider: "ZELLE",
    label: "Zelle",
    description: "Transferencias manuales vía Zelle. Los datos se muestran al usuario al pagar.",
    type: "manual",
    Icon: Zap,
    color: "purple",
    fields: [
      { key: "email", label: "Email de Zelle", placeholder: "pagos@academia.com", extra: true },
      { key: "holderName", label: "Nombre del Titular", placeholder: "Academia Crédito USA", extra: true },
    ],
  },
  {
    provider: "BANK_TRANSFER",
    label: "Transferencia Bancaria (ACH/Wire)",
    description: "Transferencia bancaria americana. Los datos se muestran al usuario al pagar.",
    type: "manual",
    Icon: Building2,
    color: "slate",
    fields: [
      { key: "bankName",      label: "Nombre del Banco",        placeholder: "Bank of America",         extra: true },
      { key: "accountName",   label: "Titular de la Cuenta",    placeholder: "Academia Credito USA LLC", extra: true },
      { key: "accountNumber", label: "Número de Cuenta",        placeholder: "123456789",                extra: true },
      { key: "routingNumber", label: "Routing Number (ABA)",    placeholder: "021000021",                extra: true },
      { key: "accountType",   label: "Tipo de Cuenta",          placeholder: "Checking",                 extra: true },
      { key: "instructions",  label: "Instrucciones adicionales", placeholder: "Incluir nombre completo en el memo", extra: true },
    ],
  },
];

const COLOR_MAP: Record<string, string> = {
  indigo: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  purple: "bg-amber-50 text-amber-700 border-purple-100",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
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
    <div
      className={`bg-card rounded-xl border shadow-sm overflow-hidden transition-all ${
        form.isEnabled ? "border-card-border" : "border-card-border"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 cursor-pointer hover:bg-card-hover transition-colors"
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <p className="font-bold text-foreground">{def.label}</p>
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  def.type === "automatic"
                    ? "bg-amber-50 text-accent"
                    : "bg-section-alt text-muted"
                }`}
              >
                {def.type === "automatic" ? "Automático" : "Manual"}
              </span>
            </div>
            <p className="text-xs text-muted font-medium mt-0.5">{def.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setForm((f) => ({ ...f, isEnabled: !f.isEnabled }));
            }}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              form.isEnabled ? "bg-accent" : "bg-muted/20"
            }`}
          >
            <div
              className={`w-5 h-5 bg-card rounded-full shadow absolute top-0.5 transition-transform ${
                form.isEnabled ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
          <ChevronDown
            size={18}
            className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {open && (
        <div className="px-4 sm:px-8 pb-6 sm:pb-8 border-t border-card-border pt-6 bg-section-alt/30 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold">{error}</div>
          )}

          {def.fields.map((field) => {
            const isSecret = field.secret;
            const isExtra = field.extra;
            const value = isExtra ? form.extra[field.key] ?? "" : (form as any)[field.key] ?? "";
            const visible = showSecrets[field.key];

            return (
              <div key={field.key}>
                <label className="block text-xs font-bold text-foreground mb-1.5">{field.label}</label>
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
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-2">
            {saved && (
              <span className="flex items-center gap-2 text-green-600 text-xs font-bold">
                <CheckCircle size={14} /> Guardado correctamente
              </span>
            )}
            {!saved && <span />}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-[#0B1F3A] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-accent transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Guardando..." : "Guardar"}
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
    <div className="max-w-3xl">
      <p className="text-muted font-medium mb-8">Configura las pasarelas activas y los datos de las cuentas de pago manual.</p>
      <div className="space-y-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 ml-1">
            Pasarelas Automáticas
          </p>
          <div className="space-y-4">
            {automatic.map((def) => (
              <GatewayCard key={def.provider} def={def} initialConfig={configMap[def.provider]} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 ml-1">
            Métodos Manuales
          </p>
          <div className="space-y-4">
            {manual.map((def) => (
              <GatewayCard key={def.provider} def={def} initialConfig={configMap[def.provider]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
