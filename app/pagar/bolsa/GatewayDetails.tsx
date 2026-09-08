"use client";

import { useRef, useState } from "react";
import {
  Building2, Copy, Check, Smartphone, Zap, QrCode,
  Upload, ImageIcon, Loader2, Phone,
} from "lucide-react";

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between bg-section-alt rounded-xl px-4 py-3 border border-card-border">
      <div>
        <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-0.5">
          {label}
        </p>
        <p className="text-sm font-bold text-foreground font-mono">{value}</p>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

export default function GatewayDetails({
  selectedMethod,
  config,
  effectivePrice,
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
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
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
                  {totalBolivares !== null && <CopyButton text={totalBolivares.toFixed(2)} />}
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

          <div className="space-y-2.5">
            <DetailRow label="Banco" value={config.bankName} />
            <DetailRow label="Teléfono Receptor" value={config.phoneNumber} />
            <DetailRow label="Cédula / RIF" value={config.idNumber} />
            <DetailRow label="Titular" value={config.holderName} />
          </div>
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
              <div className="relative group cursor-pointer" onClick={() => onZoomQr(config.qrImage)}>
                <div className="w-36 h-36 bg-white p-2 rounded-xl border border-purple-100 shadow-sm flex items-center justify-center">
                  <img src={config.qrImage} alt="Código QR Zelle" className="w-full h-full object-contain" />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                  Ampliar
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
            <DetailRow label="Correo Zelle" value={config.email} />
            <DetailRow label="Titular" value={config.holderName} />
            <DetailRow label="Monto Exacto" value={`$${effectivePrice}.00 USD`} />
          </div>
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
              <div className="relative group cursor-pointer" onClick={() => onZoomQr(config.qrImage)}>
                <div className="w-36 h-36 bg-white p-2 rounded-xl border border-amber-100 shadow-sm flex items-center justify-center">
                  <img src={config.qrImage} alt="Código QR Binance Pay" className="w-full h-full object-contain" />
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                  Ampliar
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
            <DetailRow label="Binance Pay ID" value={config.payId} />
            <DetailRow label="Binance UID" value={config.binanceId} />
            <DetailRow label="Correo / Teléfono" value={config.email} />
            <DetailRow label="Monto Exacto" value={`${effectivePrice}.00 USDT`} />
          </div>
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
            <DetailRow label="Banco" value={config.bankName} />
            <DetailRow label="Titular" value={config.accountName} />
            <DetailRow label="Número de Cuenta" value={config.accountNumber} />
            <DetailRow label="Routing (ABA)" value={config.routingNumber} />
            <DetailRow label="Tipo de Cuenta" value={config.accountType} />
            <DetailRow label="Monto" value={`$${effectivePrice}.00 USD`} />
          </div>
        </div>
      )}

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

      {/* FORM TO ENTER REFERENCE AND UPLOAD COMPROBANTE */}
      <form onSubmit={onSubmit} className="space-y-4 pt-4 border-t border-card-border">
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
                onChange={(e) => onPhoneNumber(e.target.value)}
                placeholder="Ej. 0414-1234567"
                className="w-full bg-background border border-card-border rounded-2xl py-4 pl-11 pr-4 outline-none focus:border-accent transition-all text-foreground placeholder:text-muted text-sm font-medium font-mono"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-black uppercase tracking-widest text-muted block mb-2 ml-1">
            {refLabel}
          </label>
          <input
            type="text"
            required
            value={reference}
            onChange={(e) => onReference(e.target.value)}
            placeholder={refPlaceholder}
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
                <a href={receiptImage} target="_blank" rel="noreferrer" className="text-xs text-accent font-bold hover:underline flex items-center gap-1">
                  <ImageIcon size={12} /> Ver
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onReceiptChange(null);
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
                  if (file) onUpload(file);
                }}
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || uploadingReceipt || !reference.trim() || !receiptImage}
          className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-600/25"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {loading ? "Enviando para revisión..." : submitLabel}
        </button>
      </form>
    </>
  );
}