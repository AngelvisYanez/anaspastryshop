"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { createCourseInscription, type PaymentMethod } from "@/lib/actions/inscription";
import type { WorkshopDetails } from "@/lib/utils/workshop";
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
import { CursoPaymentStep, CursoSuccessStep } from "./CursoCheckoutSteps";

interface CourseProps {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string | null;
  category: string;
  totalHours: number;
  totalClasses: number;
  instructorName: string;
}

const HERO_TITLES = [
  "Crea tu cuenta para inscribirte",
  "Finaliza tu inscripción individual",
  "¡Comprobante de inscripción recibido!",
] as const;

export default function CheckoutCurso({
  course,
  workshopInfo,
  initialLoggedIn = false,
}: {
  course: CourseProps;
  workshopInfo?: WorkshopDetails;
  initialLoggedIn?: boolean;
  initialName?: string;
  initialEmail?: string;
}) {
  const [step, setStep] = useState<CheckoutStep>(initialLoggedIn ? 2 : 1);
  const register = useCheckoutRegister(setStep);
  const coupon = useCheckoutCoupon(course.price);
  const pay = useCheckoutPayment({ amountUsd: coupon.effectivePrice });

  const isWorkshop =
    workshopInfo?.isWorkshop ?? /workshop|taller|presencial/i.test(course.title);
  const submitLabel = isWorkshop
    ? "Confirmar e Inscribirme al Workshop"
    : "Confirmar Pago del Curso Online";

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
      const result = await createCourseInscription({
        cursoId: course.id,
        method: pay.selectedMethod as PaymentMethod,
        reference: pay.reference.trim(),
        phoneNumber: pay.phoneNumber.trim() || undefined,
        amountPaid: coupon.effectivePrice,
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
        backHref={`/cursos/${course.id}`}
        backLabel="Volver al Detalle"
        badge={
          <div className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 w-fit mx-auto text-xs font-semibold text-white/90">
            <BookOpen size={16} className="text-pink-200" />
            <span>{isWorkshop ? "Workshop Presencial" : "Curso Online"}</span>
          </div>
        }
        title={HERO_TITLES[step - 1]}
        subtitle={course.title}
        className="mb-12"
      />

      <div className="max-w-xl mx-auto px-4">
        <CheckoutStepIndicator step={step} />
        <CheckoutErrorBanner error={register.error} />

        {step === 1 && (
          <CheckoutRegisterForm
            idPrefix="curso"
            loading={register.loading}
            onSubmit={register.handleRegister}
            loginHref={`/iniciar-sesion?callbackUrl=/pagar/curso/${course.id}`}
          />
        )}

        {step === 2 && (
          <CursoPaymentStep
            course={course}
            isWorkshop={isWorkshop}
            workshopInfo={workshopInfo}
            coupon={coupon}
            pay={pay}
            loading={register.loading}
            submitLabel={submitLabel}
            onReceiptUpload={handleReceiptUpload}
            onPaymentSubmit={handlePaymentSubmit}
          />
        )}

        {step === 3 && (
          <CursoSuccessStep
            course={course}
            isWorkshop={isWorkshop}
            workshopInfo={workshopInfo}
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
