"use server";

export interface CouponResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

interface PredefinedCoupon {
  code: string;
  discountPercent: number;
  description: string;
  onlyBundle?: boolean;
}

const COUPONS: PredefinedCoupon[] = [
  {
    code: "TODOSLOSCURSOS",
    discountPercent: 40,
    description: "Cupón promocional por la compra de todos los cursos online (40% de descuento)",
    onlyBundle: false,
  },
  {
    code: "PROMO-ALL",
    discountPercent: 40,
    description: "Cupón especial para el paquete de cursos online (40% de descuento)",
    onlyBundle: false,
  },
  {
    code: "CURSOSONLINE",
    discountPercent: 25,
    description: "Cupón de bienvenida para cursos online (25% de descuento)",
    onlyBundle: false,
  },
  {
    code: "ANAPASTELERA",
    discountPercent: 20,
    description: "Cupón especial de la Chef Anais Flores (20% de descuento)",
    onlyBundle: false,
  },
];

export async function validateCoupon(
  code: string,
  originalAmount: number,
  isBundle: boolean = false
): Promise<CouponResult> {
  const cleanCode = (code || "").trim().toUpperCase();

  if (!cleanCode) {
    return {
      valid: false,
      code: "",
      discountPercent: 0,
      discountAmount: 0,
      finalAmount: originalAmount,
      message: "Por favor ingresa un código de cupón.",
    };
  }

  const coupon = COUPONS.find((c) => c.code === cleanCode);

  if (!coupon) {
    return {
      valid: false,
      code: cleanCode,
      discountPercent: 0,
      discountAmount: 0,
      finalAmount: originalAmount,
      message: "El cupón ingresado no es válido o ha expirado.",
    };
  }

  if (coupon.onlyBundle && !isBundle) {
    return {
      valid: false,
      code: cleanCode,
      discountPercent: 0,
      discountAmount: 0,
      finalAmount: originalAmount,
      message: "Este cupón aplica exclusivamente para la compra del paquete de todos los cursos online.",
    };
  }

  const discountAmount = Math.round(((originalAmount * coupon.discountPercent) / 100) * 100) / 100;
  const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100);

  return {
    valid: true,
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    discountAmount,
    finalAmount,
    message: `${coupon.description} aplicado con éxito (-${coupon.discountPercent}%).`,
  };
}
