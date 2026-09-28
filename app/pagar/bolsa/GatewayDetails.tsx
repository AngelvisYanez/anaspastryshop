"use client";

import { Building2, Check, Smartphone, Zap, QrCode, Loader2, Phone } from "lucide-react";
import { useMemo } from "react";
import { PaymentMethodHeader } from "@/components/PaymentMethodHeader";
import { AccountDetailRows } from "@/components/AccountDetailRows";
import { PaymentReceiptField } from "@/components/PaymentReceiptField";
import { BcvConversionBox } from "@/components/checkout/BcvConversionBox";
import { formatBcvDate } from "@/lib/utils/formatBcvDate";
import { PaymentQrPreview } from "@/components/checkout/PaymentQrPreview";

function MethodPanels({
  selectedMethod,
  config,
  totalBolivares,
  effectiveBcvRate,
  bcvLoading,
  bcvDateLabel,
  onZoomQr,
}: {
  selectedMethod: string;
  config: Record<string, string>;
  totalBolivares: number | null;
  effectiveBcvRate: number | null;
  bcvLoading: boolean;
  bcvDateLabel: string | null;
  onZoomQr: (url: string) => void;
}) {
  if (selectedMethod === "PAGO_MOVIL") {
    return (
      <div className="space-y-5">
        <PaymentMethodHeader
          icon={<Smartphone size={20} />}
          iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          title="Pago Móvil (Tasa Oficial BCV)"
          badge={{ text: "BCV Oficial", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" }}
          subtitle="Calculado al cambio oficial del Banco Central de Venezuela"
        />
        <BcvConversionBox
          totalBolivares={totalBolivares}
          effectiveBcvRate={effectiveBcvRate}
          bcvLoading={bcvLoading}
          bcvDateLabel={bcvDateLabel}
        />
        <AccountDetailRows
          rows={[
            { label: "Banco", value: config.bankName },
            { label: "Teléfono Receptor", value: config.phoneNumber },
            { label: "Cédula / RIF", value: config.idNumber },
            { label: "Titular", value: config.holderName },
          ]}
        />
      </div>
    );
  }

  if (selectedMethod === "ZELLE") {
    return (
      <div className="space-y-5">
        <PaymentMethodHeader
          icon={<Zap size={20} />}
          iconClassName="bg-purple-500/10 text-purple-600 dark:text-purple-400"
          title="Zelle (con Código QR)"
          badge={{ text: "Escaneo QR", className: "bg-purple-500/15 text-purple-600 dark:text-purple-400" }}
          subtitle="Transfiere desde tu banca móvil escaneando el código QR o usando el correo"
        />
        {config.qrImage && (
          <PaymentQrPreview
            imageUrl={config.qrImage}
            onZoom={onZoomQr}
            title="Escaneo Rápido"
            hint="Abre tu app bancaria y escanea el QR directamente para evitar errores."
            tone="purple"
          />
        )}
        <AccountDetailRows
          rows={[
            { label: "Correo Zelle", value: config.email },
            { label: "Titular", value: config.holderName },
          ]}
        />
      </div>
    );
  }

  if (selectedMethod === "BINANCE") {
    return (
      <div className="space-y-5">
        <PaymentMethodHeader
          icon={<QrCode size={20} />}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          title="Binance Pay (Cero Comisión)"
          badge={{ text: "USDT", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400" }}
          subtitle="Envía USDT instantáneamente escaneando el código QR o con el Pay ID"
        />
        {config.qrImage && (
          <PaymentQrPreview
            imageUrl={config.qrImage}
            onZoom={onZoomQr}
            title="Escanea con tu Binance App"
            hint="Abre Binance > Escanear QR para realizar el envío directo sin comisión de red."
            tone="amber"
          />
        )}
        <AccountDetailRows
          rows={[
            { label: "Binance Pay ID", value: config.payId },
            { label: "Binance UID", value: config.binanceId },
            { label: "Correo / Teléfono", value: config.email },
          ]}
        />
      </div>
    );
  }

  if (selectedMethod === "BANK_TRANSFER") {
    return (
      <div className="space-y-5">
        <PaymentMethodHeader
          icon={<Building2 size={20} className="text-accent" />}
          iconClassName="bg-accent-subtle"
          title="Transferencia Bancaria"
          subtitle="Realiza el pago a esta cuenta bancaria"
        />
        <AccountDetailRows
          rows={[
            { label: "Banco", value: config.bankName },
            { label: "Titular", value: config.accountName },
            { label: "Número de Cuenta", value: config.accountNumber },
            { label: "Routing (ABA)", value: config.routingNumber },
            { label: "Tipo de Cuenta", value: config.accountType },
          ]}
        />
      </div>
    );
  }

  return null;
}

export default function GatewayDetails({
  selectedMethod,
  config,
  effectivePrice: _effectivePrice,
  totalBolivares,
  effectiveBcvRate,
  bcvLoading,
  bcvDate,
  reference,
  onReference,
  phoneNumber,
  onPhoneNumber,
  receiptImage,
  onReceiptChange,
  uploadingReceipt,
  onUpload,
  loading,
  onSubmit,
  onZoomQr,
  submitLabel,
  submitDisabled = false,
}: {
  selectedMethod: string;
  config: Record<string, string>;
  effectivePrice: number;
  totalBolivares: number | null;
  effectiveBcvRate: number | null;
  bcvLoading: boolean;
  bcvDate: string | null;
  reference: string;
  onReference: (s: string) => void;
  phoneNumber: string;
  onPhoneNumber: (s: string) => void;
  receiptImage: string | null;
  onReceiptChange: (url: string | null) => void;
  uploadingReceipt: boolean;
  onUpload: (file: File) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onZoomQr: (url: string) => void;
  submitLabel: string;
  submitDisabled?: boolean;
}) {
  const refLabel =
    selectedMethod === "BINANCE"
      ? "Binance Order ID / ID de Transacción"
      : selectedMethod === "PAGO_MOVIL"
        ? "Número de Referencia (4 a 8 dígitos)"
        : "Número de Referencia / ID de Confirmación";

  const refPlaceholder =
    selectedMethod === "BINANCE"
      ? "Ej. 2039481726"
      : selectedMethod === "PAGO_MOVIL"
        ? "Ej. 123456"
        : "Ej. 987654321";

  const bcvDateLabel = useMemo(() => (bcvDate ? formatBcvDate(bcvDate) : null), [bcvDate]);

  return (
    <>
      <MethodPanels
        selectedMethod={selectedMethod}
        config={config}
        totalBolivares={totalBolivares}
        effectiveBcvRate={effectiveBcvRate}
        bcvLoading={bcvLoading}
        bcvDateLabel={bcvDateLabel}
        onZoomQr={onZoomQr}
      />

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

      <form onSubmit={onSubmit} className="space-y-4 pt-4 border-t border-card-border">
        {selectedMethod === "PAGO_MOVIL" && (
          <div>
            <label
              htmlFor="gateway-phone"
              className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1"
            >
              Teléfono desde el que pagaste
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input
                id="gateway-phone"
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => onPhoneNumber(e.target.value)}
                placeholder="Ej. 0414-1234567"
                className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm font-medium font-mono"
              />
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="gateway-reference"
            className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1"
          >
            {refLabel}
          </label>
          <input
            id="gateway-reference"
            type="text"
            required
            value={reference}
            onChange={(e) => onReference(e.target.value)}
            placeholder={refPlaceholder}
            className="w-full bg-background border border-card-border rounded-2xl py-4 px-4 outline-none focus:border-accent transition text-foreground placeholder:text-muted text-sm font-medium font-mono"
          />
        </div>

        <PaymentReceiptField
          caption="Captura o Comprobante de Pago"
          inputId="gateway-receipt"
          receiptImage={receiptImage}
          onReceiptChange={onReceiptChange}
          uploadingReceipt={uploadingReceipt}
          onUpload={onUpload}
        />

        <button
          type="submit"
          disabled={
            loading ||
            uploadingReceipt ||
            !reference.trim() ||
            !receiptImage ||
            submitDisabled
          }
          className="w-full bg-accent-solid hover:bg-accent-solid-hover text-white py-4 rounded-2xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-accent-solid/25"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {loading ? "Enviando para revisión..." : submitLabel}
        </button>
      </form>
    </>
  );
}
