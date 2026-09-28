"use client";

import type { CouponResult } from "@/lib/actions/coupons";
import type { WorkshopDetails } from "@/lib/utils/workshop";
import GatewayDetails from "@/app/pagar/bolsa/GatewayDetails";
import { PaymentMethodsGrid } from "@/components/PaymentMethodsGrid";
import { GatewayPanel } from "@/components/GatewayPanel";
import { CheckoutCouponField } from "@/components/checkout/CheckoutCouponField";
import { MANUAL_PROVIDERS } from "@/components/checkout/manualProviders";
import {
  CheckoutSuccessPanel,
  SuccessDetailRow,
} from "@/components/checkout/CheckoutSuccessPanel";
import { CursoOrderSummary } from "./CursoOrderSummary";

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

export function CursoPaymentStep({
  course,
  isWorkshop,
  workshopInfo,
  coupon,
  pay,
  loading,
  submitLabel,
  onReceiptUpload,
  onPaymentSubmit,
}: {
  course: { title: string; price: number; totalHours: number };
  isWorkshop: boolean;
  workshopInfo?: WorkshopDetails;
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
      <CursoOrderSummary
        course={course}
        isWorkshop={isWorkshop}
        workshopInfo={workshopInfo}
        appliedCoupon={coupon.appliedCoupon}
      />

      <CheckoutCouponField
        inputId="curso-coupon"
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

export function CursoSuccessStep({
  course,
  isWorkshop,
  workshopInfo,
  selectedMethod,
  reference,
  effectivePrice,
  appliedCoupon,
}: {
  course: { id: string; title: string };
  isWorkshop: boolean;
  workshopInfo?: WorkshopDetails;
  selectedMethod: string;
  reference: string;
  effectivePrice: number;
  appliedCoupon: CouponResult | null;
}) {
  return (
    <CheckoutSuccessPanel
      description={
        <p>
          Hemos registrado tu pago para <strong>{course.title}</strong>.
        </p>
      }
      details={
        <>
          <SuccessDetailRow label="Programa:" value={course.title} />
          <SuccessDetailRow
            label="Modalidad:"
            value={isWorkshop ? "Workshop Presencial" : "Curso Online"}
          />
          {isWorkshop && workshopInfo?.location && (
            <SuccessDetailRow label="Ubicación:" value={workshopInfo.location} />
          )}
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
      primaryHref={`/dashboard/cursos/${course.id}`}
      primaryLabel="Ver Contenido en el Dashboard"
    />
  );
}
