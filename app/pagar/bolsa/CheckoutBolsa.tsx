"use client";

import { useState } from "react";
import { ShoppingBag, CheckCircle } from "lucide-react";
import {
  createBulkCourseInscriptions,
  type PaymentMethod,
} from "@/lib/actions/inscription";
import PageHero from "@/components/PageHero";
import { ZoomQrDialog } from "@/components/ZoomQrDialog";
import {
  CheckoutStepIndicator,
  type CheckoutStep,
} from "@/components/checkout/CheckoutStepIndicator";
import { useCheckoutPayment } from "@/components/checkout/useCheckoutPayment";
import { useCheckoutCoupon } from "@/components/checkout/useCheckoutCoupon";
import { useCheckoutRegister } from "@/components/checkout/useCheckoutRegister";
import { CheckoutRegisterForm } from "@/components/checkout/CheckoutRegisterForm";
import { CheckoutErrorBanner } from "@/components/checkout/CheckoutErrorBanner";
import { validateManualPayment } from "@/components/checkout/validateManualPayment";
import { type BagCourse } from "./BolsaOrderSummary";
import { BolsaPaymentStep, BolsaSuccessStep } from "./BolsaCheckoutSteps";

export type { BagCourse };

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function distributeAmounts(prices: number[], finalTotal: number): number[] {
  const rawTotal = prices.reduce((a, b) => a + b, 0);
  if (finalTotal >= rawTotal || prices.length === 0) {
    return prices.map((p) => round2(p));
  }
  const scale = finalTotal / rawTotal;
  const amounts = prices.map((p) => round2(p * scale));
  const diff = round2(finalTotal - amounts.reduce((a, b) => a + b, 0));
  amounts[amounts.length - 1] = round2(amounts[amounts.length - 1] + diff);
  return amounts;
}

const HERO_TITLES = [
  "Crea tu cuenta para inscribirte",
  "Finaliza el pago de tu bolsa",
  "¡Comprobante de inscripción recibido!",
] as const;

export default function CheckoutBolsa({
  courses,
  skippedApproved,
  initialLoggedIn = false,
}: {
  courses: BagCourse[];
  skippedApproved: number;
  initialLoggedIn?: boolean;
}) {
  const [step, setStep] = useState<CheckoutStep>(initialLoggedIn ? 2 : 1);
  const register = useCheckoutRegister(setStep);
  const total = courses.reduce((acc, c) => acc + c.price, 0);
  const coupon = useCheckoutCoupon(total);
  const payments = distributeAmounts(
    courses.map((c) => c.price),
    coupon.effectivePrice,
  );
  const pay = useCheckoutPayment({ amountUsd: coupon.effectivePrice });

  const itemsQuery = courses.map((c) => c.id).join(",");
  const submitLabel = `Confirmar Pago${coupon.appliedCoupon ? "" : " de la Bolsa"} ($${coupon.effectivePrice} USD)`;

  async function handleReceiptUpload(file: File) {
    register.setError(null);
    await pay.handleReceiptUpload(file, register.setError);
  }

  async function handlePaymentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    register.setError(null);

    const validationError = validateManualPayment({
      reference: pay.reference,
      selectedMethod: pay.selectedMethod,
      phoneNumber: pay.phoneNumber,
      receiptImage: pay.receiptImage,
    });
    if (validationError) {
      register.setError(validationError);
      return;
    }

    register.setLoading(true);
    try {
      const result = await createBulkCourseInscriptions({
        items: courses.map((c, i) => ({ cursoId: c.id, amountPaid: payments[i] })),
        method: pay.selectedMethod as PaymentMethod,
        reference: pay.reference.trim(),
        phoneNumber: pay.phoneNumber.trim() || undefined,
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
        backHref="/cursos"
        backLabel="Volver al Catálogo"
        badge={
          <div className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 w-fit mx-auto text-xs font-semibold text-white/90">
            <ShoppingBag size={16} className="text-pink-200" />
            <span>
              {courses.length} {courses.length === 1 ? "Formación" : "Formaciones"} en tu Bolsa
            </span>
          </div>
        }
        title={HERO_TITLES[step - 1]}
        subtitle="Cursos online y workshops presenciales seleccionados."
        className="mb-12"
      />

      <div className="max-w-xl mx-auto px-4">
        <CheckoutStepIndicator step={step} />
        <CheckoutErrorBanner error={register.error} />

        {skippedApproved > 0 && (
          <div className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 p-4 rounded-2xl text-sm font-bold mb-6 text-center border border-green-200 dark:border-green-800 flex items-center justify-center gap-2">
            <CheckCircle size={16} className="shrink-0" />
            <span>
              {skippedApproved}{" "}
              {skippedApproved === 1
                ? "formación fue descartada"
                : "formaciones fueron descartadas"}{" "}
              de la bolsa porque ya tienes acceso activo.
            </span>
          </div>
        )}

        {step === 1 && (
          <CheckoutRegisterForm
            idPrefix="bolsa"
            loading={register.loading}
            onSubmit={register.handleRegister}
            loginHref={`/iniciar-sesion?callbackUrl=${encodeURIComponent(`/pagar/bolsa?items=${itemsQuery}`)}`}
          />
        )}

        {step === 2 && (
          <BolsaPaymentStep
            courses={courses}
            total={total}
            coupon={coupon}
            pay={pay}
            loading={register.loading}
            submitLabel={submitLabel}
            onReceiptUpload={handleReceiptUpload}
            onPaymentSubmit={handlePaymentSubmit}
          />
        )}

        {step === 3 && (
          <BolsaSuccessStep
            courses={courses}
            selectedMethod={pay.selectedMethod}
            reference={pay.reference}
            effectivePrice={coupon.effectivePrice}
            appliedCoupon={coupon.appliedCoupon}
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
