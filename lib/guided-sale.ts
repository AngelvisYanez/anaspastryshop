import type { Prisma } from "@prisma/client";

export const guidedPaymentMethods = {
  PAGO_MOVIL: "Pago móvil",
  BANK_TRANSFER: "Transferencia bancaria",
  ZELLE: "Zelle",
  BINANCE: "Binance Pay",
  USDT: "USDT",
} as const;

export const guidedReceiptMaxBytes = 5 * 1024 * 1024;
export const guidedReceiptTypes = ["image/jpeg", "image/png", "image/webp"];

export function sellableFormations(now = new Date()): Prisma.CursoWhereInput {
  return { OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", publishedAt: { lte: now } }] };
}

export function normalizeGuidedEmail(value: string) {
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function guidedAmount(value: string) {
  const decimal = value.trim().replace(",", ".");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(decimal)) return null;
  const amount = Number(decimal);
  return amount > 0 ? amount : null;
}

export function guidedReceiptError(file: File | null) {
  if (!file?.size || !guidedReceiptTypes.includes(file.type)) return "Adjunta el comprobante en JPG, PNG o WebP.";
  return file.size > guidedReceiptMaxBytes ? "El comprobante puede pesar hasta 5 MB." : null;
}
