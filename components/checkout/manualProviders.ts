import { Smartphone, Zap, QrCode, Building2 } from "lucide-react";

export const MANUAL_PROVIDERS: {
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

export const MANUAL_PROVIDER_KEYS = new Set(MANUAL_PROVIDERS.map((p) => p.key));

export const PROVIDER_ORDER = ["PAGO_MOVIL", "ZELLE", "BINANCE", "BANK_TRANSFER"] as const;

/** Etiquetas públicas para listar solo los métodos realmente habilitados. */
const PAYMENT_DISPLAY_LABELS: Record<string, string> = {
  PAGO_MOVIL: "Pago Móvil BCV",
  ZELLE: "Zelle QR",
  BINANCE: "Binance Pay",
  BANK_TRANSFER: "Transferencia",
  STRIPE: "Tarjeta (Stripe)",
  PAYPAL: "PayPal",
};

const PAYMENT_DISPLAY_ORDER = [
  "PAGO_MOVIL",
  "ZELLE",
  "BINANCE",
  "BANK_TRANSFER",
  "STRIPE",
  "PAYPAL",
] as const;

export function labelsForEnabledProviders(providers: string[]): string[] {
  const enabled = new Set(providers);
  return PAYMENT_DISPLAY_ORDER.filter((key) => enabled.has(key)).map(
    (key) => PAYMENT_DISPLAY_LABELS[key]
  );
}

