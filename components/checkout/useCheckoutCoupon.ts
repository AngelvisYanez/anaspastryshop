"use client";

import { useState } from "react";
import { validateCoupon, type CouponResult } from "@/lib/actions/coupons";

export function useCheckoutCoupon(
  baseAmount: number,
  options: { cursoIds?: string[] } = {}
) {
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
  const [couponMessage, setCouponMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);

  const effectivePrice = appliedCoupon ? appliedCoupon.finalAmount : baseAmount;
  const cursoIds = options.cursoIds ?? [];

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);
    let res: Awaited<ReturnType<typeof validateCoupon>>;
    try {
      res = await validateCoupon(couponInput.trim(), baseAmount, {
        cursoIds,
        itemCount: Math.max(1, cursoIds.length),
      });
    } finally {
      setCouponLoading(false);
    }
    if (res.valid) {
      setAppliedCoupon(res);
      setCouponMessage({
        text: `¡Cupón ${res.code} aplicado! Ahorras $${res.discountAmount} USD (${res.discountPercent}% OFF).`,
        success: true,
      });
    } else {
      setAppliedCoupon(null);
      setCouponMessage({ text: res.message || "Cupón no válido.", success: false });
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMessage(null);
  }

  return {
    couponInput,
    setCouponInput,
    couponLoading,
    appliedCoupon,
    couponMessage,
    effectivePrice,
    handleApplyCoupon,
    handleRemoveCoupon,
  };
}
