/** Scope rules for ANY/ALL coupons (pure helper — not a Server Action). */
export function matchesCouponScope(
  coupon: { minItems: number; applyMode: string; cursoIds: string[] },
  cartIds: string[],
  itemCount: number
): { ok: boolean; message?: string } {
  if (itemCount < coupon.minItems) {
    return {
      ok: false,
      message: `Este cupón requiere al menos ${coupon.minItems} formación${coupon.minItems === 1 ? "" : "es"} en la compra.`,
    };
  }

  const restricted = coupon.cursoIds.length > 0;

  if (coupon.applyMode === "ALL") {
    const required = restricted ? coupon.cursoIds : [];
    if (required.length === 0) {
      if (itemCount < coupon.minItems) {
        return {
          ok: false,
          message: `Este cupón aplica al comprar ${coupon.minItems} formaciones en conjunto.`,
        };
      }
      return { ok: true };
    }
    const missing = required.filter((id) => !cartIds.includes(id));
    if (missing.length > 0) {
      return {
        ok: false,
        message:
          "Este cupón aplica solo al comprar el conjunto completo de formaciones configuradas (p. ej. ambos cursos online).",
      };
    }
    return { ok: true };
  }

  // ANY
  if (!restricted) return { ok: true };

  const matched = cartIds.filter((id) => coupon.cursoIds.includes(id)).length;
  if (matched < coupon.minItems) {
    return {
      ok: false,
      message: `Este cupón requiere al menos ${coupon.minItems} de las formaciones seleccionadas en su configuración.`,
    };
  }
  return { ok: true };
}
