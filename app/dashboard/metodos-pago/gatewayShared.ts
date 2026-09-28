import {
  CreditCard, Zap, DollarSign, Building2, Smartphone, QrCode,
} from "lucide-react";

export type GatewayConfig = {
  provider: string;
  isEnabled: boolean;
  publicKey: string | null;
  secretKey: string | null;
  webhookSecret: string | null;
  extraConfig: Record<string, string> | null;
};

export type GatewayDef = {
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

export const COLOR_MAP: Record<string, string> = {
  indigo: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-400 dark:border-pink-800",
  blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800",
  yellow: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  slate: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700",
};

export const GATEWAYS: GatewayDef[] = [
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
