"use client";

import { useState } from "react";
import { createPastryServicePayment, type PaymentMethod } from "@/lib/actions/inscription";
import PageHero from "@/components/PageHero";
import { PaymentMethodsGrid } from "@/components/PaymentMethodsGrid";
import { ZoomQrDialog } from "@/components/ZoomQrDialog";
import { GatewayPanel } from "@/components/GatewayPanel";
import GatewayDetails from "@/app/pagar/bolsa/GatewayDetails";
import {
  CheckoutStepIndicator,
  type CheckoutStep,
} from "@/components/checkout/CheckoutStepIndicator";
import { MANUAL_PROVIDERS } from "@/components/checkout/manualProviders";
import { useCheckoutPayment } from "@/components/checkout/useCheckoutPayment";
import { useCheckoutRegister } from "@/components/checkout/useCheckoutRegister";
import { CheckoutRegisterForm } from "@/components/checkout/CheckoutRegisterForm";
import { CheckoutErrorBanner } from "@/components/checkout/CheckoutErrorBanner";
import {
  CheckoutSuccessPanel,
  SuccessDetailRow,
} from "@/components/checkout/CheckoutSuccessPanel";
import { validateManualPayment } from "@/components/checkout/validateManualPayment";
import { PasteleriaOrderForm } from "./PasteleriaOrderForm";

export default function CheckoutPasteleria({
  initialLoggedIn,
}: {
  initialLoggedIn: boolean;
  initialName?: string | null;
  initialEmail?: string | null;
}) {
  const [step, setStep] = useState<CheckoutStep>(initialLoggedIn ? 2 : 1);
  const register = useCheckoutRegister(setStep);
  const [serviceDescription, setServiceDescription] = useState("");
  const [amountPaidStr, setAmountPaidStr] = useState("");

  const numAmount = parseFloat(amountPaidStr);
  const amountUsd = !isNaN(numAmount) && numAmount > 0 ? numAmount : 0;
  const pay = useCheckoutPayment({
    enabled: step === 2,
    amountUsd,
  });

  const heroTitle =
    step === 1
      ? "Crea tu cuenta para reportar tu pago"
      : step === 2
        ? "Detalle del Pedido & Pago"
        : "Comprobante de Pedido Recibido";

  async function handleReceiptUpload(file: File) {
    register.setError(null);
    await pay.handleReceiptUpload(file, register.setError);
  }

  async function handlePaymentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    register.setError(null);

    if (!serviceDescription.trim()) {
      register.setError(
        "Por favor describe el servicio de pastelería o pedido (ej. Torta de boda, mesa de dulces).",
      );
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      register.setError(
        "Por favor ingresa un monto válido en USD acorde a tu cotización acordada.",
      );
      return;
    }

    const validationError = validateManualPayment({
      reference: pay.reference,
      selectedMethod: pay.selectedMethod,
      phoneNumber: pay.phoneNumber,
      receiptImage: pay.receiptImage,
    });
    if (validationError) {
      register.setError(
        validationError.includes("referencia")
          ? "Por favor ingresa el número de referencia o confirmación del pago."
          : validationError.includes("teléfono")
            ? "Por favor ingresa el número de teléfono emisor del Pago Móvil."
            : validationError,
      );
      return;
    }

    register.setLoading(true);
    try {
      const result = await createPastryServicePayment({
        serviceDescription: serviceDescription.trim(),
        method: pay.selectedMethod as PaymentMethod,
        reference: pay.reference.trim(),
        phoneNumber: pay.phoneNumber.trim() || undefined,
        amountPaid: numAmount,
        receiptImage: pay.receiptImage || undefined,
      });

      if (result.error) {
        register.setError(result.error);
        return;
      }
      setStep(3);
    } finally {
      register.setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-background pb-16">
      <PageHero
        variant="deep"
        backHref="/pasteleria"
        backLabel="Conoce Nuestros Servicios"
        title={heroTitle}
        subtitle="Reporta el comprobante de tu abono o pago de pastelería personalizada, tortas de diseño o catering dulce."
        className="mb-12"
      />

      <div className="max-w-xl mx-auto px-4">
        <CheckoutStepIndicator step={step} />
        <CheckoutErrorBanner error={register.error} />

        {step === 1 && (
          <CheckoutRegisterForm
            idPrefix="pasteleria"
            loading={register.loading}
            onSubmit={register.handleRegister}
            loginHref="/iniciar-sesion?callbackUrl=/pagar/pasteleria"
            minPasswordLength={8}
            submitLabel="Continuar al Pago del Pedido"
            loadingLabel="Creando cuenta..."
          />
        )}

        {step === 2 && (
          <div className="space-y-5">
            <PasteleriaOrderForm
              serviceDescription={serviceDescription}
              onServiceDescription={setServiceDescription}
              amountPaidStr={amountPaidStr}
              onAmountPaidStr={setAmountPaidStr}
            />

            {pay.availableManual.length > 1 && (
              <PaymentMethodsGrid
                methods={pay.availableManual}
                selectedKey={pay.selectedMethod}
                onSelect={pay.setSelectedMethod}
              />
            )}

            <GatewayPanel
              loading={pay.gatewaysLoading}
              hasGateway={!!pay.activeGateway}
              className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6"
              emptyMessage="Los datos de pago están siendo actualizados por administración. Por favor contáctanos directamente para coordinar tu pago."
            >
              <GatewayDetails
                selectedMethod={pay.selectedMethod}
                config={pay.config}
                effectivePrice={amountUsd}
                totalBolivares={pay.totalBolivares}
                effectiveBcvRate={pay.effectiveBcvRate}
                bcvLoading={pay.bcvLoading}
                bcvDate={pay.bcvDate}
                reference={pay.reference}
                onReference={pay.setReference}
                phoneNumber={pay.phoneNumber}
                onPhoneNumber={pay.setPhoneNumber}
                receiptImage={pay.receiptImage}
                onReceiptChange={pay.setReceiptImage}
                uploadingReceipt={pay.uploadingReceipt}
                onUpload={handleReceiptUpload}
                loading={register.loading}
                onSubmit={handlePaymentSubmit}
                onZoomQr={pay.setZoomQrUrl}
                submitLabel="Confirmar Reporte de Pago de Pastelería"
                submitDisabled={!serviceDescription.trim() || amountUsd <= 0}
              />
            </GatewayPanel>
          </div>
        )}

        {step === 3 && (
          <CheckoutSuccessPanel
            title="¡Comprobante de Pedido Recibido!"
            description={
              <>
                <p>Hemos recibido tu reporte de pago para el servicio de pastelería:</p>
                <p className="text-sm font-bold text-accent mt-2">
                  &ldquo;{serviceDescription}&rdquo;
                </p>
              </>
            }
            details={
              <>
                <SuccessDetailRow label="Servicio:" value={serviceDescription} />
                <SuccessDetailRow
                  label="Método:"
                  value={
                    MANUAL_PROVIDERS.find((p) => p.key === pay.selectedMethod)?.label ??
                    pay.selectedMethod
                  }
                />
                <SuccessDetailRow
                  label="Referencia:"
                  value={<span className="font-mono">{pay.reference}</span>}
                />
                {pay.phoneNumber && (
                  <SuccessDetailRow
                    label="Teléfono emisor:"
                    value={<span className="font-mono">{pay.phoneNumber}</span>}
                  />
                )}
                <SuccessDetailRow
                  label="Monto reportado:"
                  value={
                    <span className="text-accent">
                      ${parseFloat(amountPaidStr || "0").toFixed(2)} USD
                    </span>
                  }
                />
              </>
            }
            primaryHref="/pasteleria"
            primaryLabel="Volver a Pastelería"
            secondaryHref="/cursos"
            secondaryLabel="Explorar Workshops"
          />
        )}
      </div>

      <ZoomQrDialog
        dialogRef={pay.zoomDialogRef}
        url={pay.zoomQrUrl}
        onClose={() => pay.setZoomQrUrl(null)}
      />
    </main>
  );
}
