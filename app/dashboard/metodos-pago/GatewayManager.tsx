"use client";

import { useState } from "react";
import {
  ChevronDown, Eye, EyeOff, Save, Loader2, CheckCircle,
  CreditCard, Smartphone, Bitcoin, Zap, DollarSign, Wallet,
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
    provider: "BINANCE",
    label: "Binance Pay",
    description: "Pagos automáticos con criptomonedas vía Binance Pay API.",
    type: "automatic",
    Icon: Bitcoin,
    color: "yellow",
    fields: [
      { key: "publicKey", label: "API Key", placeholder: "Tu Binance API Key" },
      { key: "secretKey", label: "API Secret", placeholder: "Tu Binance Secret", secret: true },
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
    provider: "PAGO_MOVIL",
    label: "Pago Móvil",
    description: "Pago móvil bancario (Venezuela). Los datos se muestran al usuario al pagar.",
    type: "manual",
    Icon: Smartphone,
    color: "green",
    fields: [
      { key: "bank", label: "Banco", placeholder: "Banesco (0134)", extra: true },
      { key: "phone", label: "Teléfono", placeholder: "0412-1234567", extra: true },
      { key: "rif", label: "RIF / Cédula", placeholder: "J-123456789", extra: true },
    ],
  },
  {
    provider: "USDT",
    label: "USDT / Crypto",
    description: "Pagos manuales en cripto. Los datos se muestran al usuario al pagar.",
    type: "manual",
    Icon: Wallet,
    color: "orange",
    fields: [
      { key: "binanceId", label: "Binance Pay ID", placeholder: "123456789", extra: true },
      { key: "network", label: "Red", placeholder: "TRC20, BEP20...", extra: true },
      { key: "address", label: "Dirección de Wallet", placeholder: "0x...", extra: true },
    ],
  },
];

const COLOR_MAP: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
  purple: "bg-purple-50 text-purple-600 border-purple-100",
  green: "bg-green-50 text-green-600 border-green-100",
  orange: "bg-orange-50 text-orange-600 border-orange-100",
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
      className={`bg-white rounded-[2rem] border shadow-sm overflow-hidden transition-all ${
        form.isEnabled ? "border-gray-200" : "border-gray-100"
      }`}
    >
      <div
        className="flex items-center justify-between px-8 py-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClass}`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <p className="font-bold text-[#1A1A2E]">{def.label}</p>
              <span
                className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                  def.type === "automatic"
                    ? "bg-indigo-50 text-[#5A4FCF]"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {def.type === "automatic" ? "Automático" : "Manual"}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{def.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setForm((f) => ({ ...f, isEnabled: !f.isEnabled }));
            }}
            className={`w-12 h-6 rounded-full relative transition-colors ${
              form.isEnabled ? "bg-[#5A4FCF]" : "bg-gray-200"
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                form.isEnabled ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {open && (
        <div className="px-8 pb-8 border-t border-gray-50 pt-6 bg-gray-50/30 space-y-4">
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
                <label className="block text-xs font-bold text-[#1A1A2E] mb-1.5">{field.label}</label>
                <div className="flex gap-2">
                  <input
                    type={isSecret && !visible ? "password" : "text"}
                    value={value}
                    onChange={(e) => setField(field.key, e.target.value, isExtra)}
                    placeholder={field.placeholder}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5A4FCF] transition-all font-mono text-[#1A1A2E] placeholder:font-sans placeholder:text-gray-400"
                  />
                  {isSecret && (
                    <button
                      type="button"
                      onClick={() => toggleSecret(field.key)}
                      className="px-4 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#5A4FCF] transition-colors"
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
              className="flex items-center gap-2 bg-[#1A1A2E] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#5A4FCF] transition-all disabled:opacity-50"
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
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1A1A2E] mb-2">Métodos de Pago</h1>
        <p className="text-gray-400 font-medium">
          Configura las pasarelas activas y los datos de las cuentas de pago manual.
        </p>
      </div>

      <div className="space-y-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">
            Pasarelas Automáticas
          </p>
          <div className="space-y-4">
            {automatic.map((def) => (
              <GatewayCard key={def.provider} def={def} initialConfig={configMap[def.provider]} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">
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
