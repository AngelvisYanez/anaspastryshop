"use client";

import type { CouponResult } from "@/lib/actions/coupons";
import GatewayDetails from "./GatewayDetails";
import { BolsaOrderSummary, type BagCourse } from "./BolsaOrderSummary";
import { PaymentMethodsGrid } from "@/components/PaymentMethodsGrid";
import { GatewayPanel } from "@/components/GatewayPanel";
import { CheckoutCouponField } from "@/components/checkout/CheckoutCouponField";
import { MANUAL_PROVIDERS } from "@/components/checkout/manualProviders";
import {
  CheckoutSuccessPanel,
  SuccessDetailRow,
} from "@/components/checkout/CheckoutSuccessPanel";
import { BookOpen } from "lucide-react";

type PaySlice = {
  availableManual: { key: string; label: string; badge: string; Icon: React.ElementType }[];
  selectedMethod: string;
  setSelectedMethod: (v: string) => void;
  gatewaysLoading: boolean;
  activeGateway: unknown;
  config: Record<string, string>;
  totalBolivares: number | null;
  effectiveBcvRate: number | null;
  bcvLoading: boolean;
  bcvDate: string | null;
  reference: string;
  setReference: (v: string) => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  receiptImage: string | null;
  setReceiptImage: (v: string | null) => void;
  uploadingReceipt: boolean;
  setZoomQrUrl: (v: string | null) => void;
};

export function BolsaPaymentStep({
  courses,
  total,
  coupon,
  pay,
  loading,
  submitLabel,
  onReceiptUpload,
  onPaymentSubmit,
}: {
  courses: BagCourse[];
  total: number;
  coupon: {
    couponInput: string;
    setCouponInput: (v: string) => void;
    appliedCoupon: CouponResult | null;
    couponLoading: boolean;
    couponMessage: { text: string; success: boolean } | null;
    effectivePrice: number;
    handleApplyCoupon: () => void;
    handleRemoveCoupon: () => void;
  };
  pay: PaySlice;
  loading: boolean;
  submitLabel: string;
  onReceiptUpload: (file: File) => void;
  onPaymentSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="space-y-5">
      <BolsaOrderSummary
        courses={courses}
        total={total}
        effectivePrice={coupon.effectivePrice}
        appliedCoupon={coupon.appliedCoupon}
      />

      <CheckoutCouponField
        inputId="bolsa-coupon"
        couponInput={coupon.couponInput}
        onCouponInput={coupon.setCouponInput}
        applied={!!coupon.appliedCoupon}
        loading={coupon.couponLoading}
        message={coupon.couponMessage}
        onApply={coupon.handleApplyCoupon}
        onRemove={coupon.handleRemoveCoupon}
        onUsePromo={() => coupon.setCouponInput("TODOSLOSCURSOS")}
      />

      {pay.availableManual.length > 1 && (
        <PaymentMethodsGrid
          methods={pay.availableManual}
          selectedKey={pay.selectedMethod}
          onSelect={pay.setSelectedMethod}
        />
      )}

      <GatewayPanel loading={pay.gatewaysLoading} hasGateway={!!pay.activeGateway}>
        <GatewayDetails
          selectedMethod={pay.selectedMethod}
          config={pay.config}
          effectivePrice={coupon.effectivePrice}
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
          onUpload={onReceiptUpload}
          loading={loading}
          onSubmit={onPaymentSubmit}
          onZoomQr={pay.setZoomQrUrl}
          submitLabel={submitLabel}
        />
      </GatewayPanel>
    </div>
  );
}

export function BolsaSuccessStep({
  courses,
  selectedMethod,
  reference,
  effectivePrice,
  appliedCoupon,
}: {
  courses: BagCourse[];
  selectedMethod: string;
  reference: string;
  effectivePrice: number;
  appliedCoupon: CouponResult | null;
}) {
  return (
    <>
      <CheckoutSuccessPanel
        description={
          <p>
            Hemos registrado tu pago por{" "}
            <strong>
              {courses.length} {courses.length === 1 ? "formación" : "formaciones"}
            </strong>{" "}
            de tu bolsa.
          </p>
        }
        details={
          <>
            {courses.map((course) => (
              <div key={course.id} className="flex justify-between items-center text-xs gap-3">
                <span className="font-bold text-foreground truncate max-w-[200px]">
                  {course.title}
                </span>
                <span className="text-[10px] text-muted shrink-0">
                  {course.isWorkshop ? "Workshop" : "Curso"} · ${course.price}
                </span>
              </div>
            ))}
            <SuccessDetailRow
              label="Método:"
              value={
                MANUAL_PROVIDERS.find((p) => p.key === selectedMethod)?.label ?? selectedMethod
              }
            />
            <SuccessDetailRow
              label="Referencia:"
              value={<span className="font-mono">{reference}</span>}
            />
            <SuccessDetailRow
              label="Monto Pagado:"
              value={
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  ${effectivePrice} USD
                  {appliedCoupon && ` (Cupón: ${appliedCoupon.code})`}
                </span>
              }
            />
            <SuccessDetailRow
              label="Estado:"
              value={
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-full text-[11px] uppercase">
                  Pendiente de verificación
                </span>
              }
            />
          </>
        }
        primaryHref="/dashboard/mis-cursos"
        primaryLabel="Mis Cursos & Workshops"
        secondaryHref="/cursos"
        secondaryLabel="Seguir Explorando"
      />
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted mt-6">
        <BookOpen size={12} /> El acceso se habilita en el panel una vez aprobado el pago.
      </div>
    </>
  );
}
