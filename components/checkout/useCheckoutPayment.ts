"use client";

import { useEffect, useRef, useState } from "react";
import { MANUAL_PROVIDERS, PROVIDER_ORDER } from "@/components/checkout/manualProviders";

export type GatewayItem = {
  provider: string;
  config: Record<string, string>;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function useCheckoutPayment({
  enabled = true,
  amountUsd,
}: {
  enabled?: boolean;
  amountUsd: number;
}) {
  const [gateways, setGateways] = useState<GatewayItem[]>([]);
  const [gatewaysLoading, setGatewaysLoading] = useState(enabled);
  const [selectedMethod, setSelectedMethod] = useState("PAGO_MOVIL");

  const [reference, setReference] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [bcvDate, setBcvDate] = useState<string | null>(null);
  const [bcvLoading, setBcvLoading] = useState(false);

  const [zoomQrUrl, setZoomQrUrl] = useState<string | null>(null);
  const zoomDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = zoomDialogRef.current;
    if (!el) return;
    if (zoomQrUrl && !el.open) el.showModal();
    else if (!zoomQrUrl && el.open) el.close();
  }, [zoomQrUrl]);

  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect -- gateways and BCV must be live at checkout time on the client
  // react-doctor-disable-next-line react-doctor/no-set-state-after-await-in-effect -- cancelled guard skips updates after unmount
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      setGatewaysLoading(true);
      setBcvLoading(true);
      try {
        const [gatewaysRes, bcvRes] = await Promise.all([
          fetch("/api/gateways"),
          fetch("/api/bcv"),
        ]);

        if (cancelled) return;

        if (gatewaysRes.ok) {
          const data = await gatewaysRes.json();
          if (cancelled) return;
          const active: GatewayItem[] = data.gateways || [];
          setGateways(active);
          const first = PROVIDER_ORDER.find((k) => active.some((g) => g.provider === k));
          if (first) setSelectedMethod(first);
        }

        if (bcvRes.ok) {
          const data = await bcvRes.json();
          if (cancelled) return;
          if (data.rate || (data.success && data.rate)) {
            setBcvRate(data.rate);
            setBcvDate(data.date || null);
          }
        }
      } catch (err) {
        console.error("Error loading payment data:", err);
      } finally {
        setGatewaysLoading(false);
        setBcvLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const activeGateway = gateways.find((g) => g.provider === selectedMethod);
  const config = activeGateway?.config || {};

  const gatewayRate = config.bcvRate
    ? parseFloat(config.bcvRate)
    : config.customBcvRate
      ? parseFloat(config.customBcvRate)
      : null;
  const effectiveBcvRate =
    gatewayRate && !Number.isNaN(gatewayRate) && gatewayRate > 0 ? gatewayRate : bcvRate;
  const totalBolivares =
    effectiveBcvRate && amountUsd > 0 ? round2(amountUsd * effectiveBcvRate) : null;

  const availableManual = MANUAL_PROVIDERS.filter((mp) =>
    gateways.some((g) => g.provider === mp.key)
  );

  async function handleReceiptUpload(file: File, onError: (msg: string) => void) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError("Solo se aceptan imágenes.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError("El archivo no debe superar 5MB.");
      return;
    }
    setUploadingReceipt(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
        reader.readAsDataURL(file);
      });
      setReceiptImage(dataUrl);
    } catch {
      onError("Error al leer el comprobante.");
    } finally {
      setUploadingReceipt(false);
    }
  }

  return {
    gateways,
    gatewaysLoading,
    selectedMethod,
    setSelectedMethod,
    reference,
    setReference,
    phoneNumber,
    setPhoneNumber,
    receiptImage,
    setReceiptImage,
    uploadingReceipt,
    bcvRate,
    bcvDate,
    bcvLoading,
    zoomQrUrl,
    setZoomQrUrl,
    zoomDialogRef,
    activeGateway,
    config,
    effectiveBcvRate,
    totalBolivares,
    availableManual,
    handleReceiptUpload,
  };
}
