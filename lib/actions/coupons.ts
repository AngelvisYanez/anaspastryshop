"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { matchesCouponScope } from "@/lib/coupons/matches-scope";
import { revalidatePath } from "next/cache";

export interface CouponResult {
  valid: boolean;
  code: string;
  discountPercent: number;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

export type CouponApplyMode = "ANY" | "ALL";

export type CouponRecord = {
  id: string;
  code: string;
  description: string | null;
  discountPercent: number;
  minItems: number;
  applyMode: string;
  cursoIds: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ValidateCouponContext = {
  /** IDs de formaciones en el carrito / checkout */
  cursoIds?: string[];
  /** Cantidad de ítems (por defecto length de cursoIds o 1) */
  itemCount?: number;
};

const ONLINE_COURSE_SLUGS = ["cake-de-pina", "merengue-italiano"] as const;

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado");
  }
}

/** Asegura cupones por defecto (idempotente). */
export async function ensureDefaultCoupons() {
  const online = await prisma.curso.findMany({
    where: {
      OR: [
        { slug: { in: [...ONLINE_COURSE_SLUGS] } },
        { category: "Cursos Online", isLive: false },
      ],
    },
    select: { id: true, slug: true },
  });

  const onlineIds = online.map((c) => c.id);

  const defaults: Array<{
    code: string;
    description: string;
    discountPercent: number;
    minItems: number;
    applyMode: CouponApplyMode;
    cursoIds: string[];
  }> = [
    {
      code: "TODOSLOSCURSOS",
      description:
        "40% de descuento al comprar el conjunto de cursos online (todos los ítems del paquete)",
      discountPercent: 40,
      minItems: Math.max(2, onlineIds.length || 2),
      applyMode: "ALL",
      cursoIds: onlineIds,
    },
    {
      code: "PROMO-ALL",
      description: "40% de descuento en el paquete de cursos online",
      discountPercent: 40,
      minItems: Math.max(2, onlineIds.length || 2),
      applyMode: "ALL",
      cursoIds: onlineIds,
    },
    {
      code: "CURSOSONLINE",
      description: "25% de descuento de bienvenida en cursos online",
      discountPercent: 25,
      minItems: 1,
      applyMode: "ANY",
      cursoIds: onlineIds,
    },
    {
      code: "ANAPASTELERA",
      description: "20% de descuento especial de la Chef Anais Flores",
      discountPercent: 20,
      minItems: 1,
      applyMode: "ANY",
      cursoIds: [],
    },
  ];

  for (const d of defaults) {
    const existing = await prisma.coupon.findUnique({ where: { code: d.code } });
    if (!existing) {
      await prisma.coupon.create({
        data: {
          code: d.code,
          description: d.description,
          discountPercent: d.discountPercent,
          minItems: d.minItems,
          applyMode: d.applyMode,
          cursoIds: d.cursoIds,
          isActive: true,
        },
      });
      continue;
    }

    // Backfill: si el cupón de paquete quedó sin formaciones, completa el conjunto online.
    if (
      (d.code === "TODOSLOSCURSOS" || d.code === "PROMO-ALL") &&
      existing.cursoIds.length === 0 &&
      d.cursoIds.length > 0
    ) {
      await prisma.coupon.update({
        where: { code: d.code },
        data: {
          cursoIds: d.cursoIds,
          minItems: d.minItems,
          applyMode: d.applyMode,
          description: d.description,
        },
      });
    }
  }
}

function invalidResult(
  code: string,
  originalAmount: number,
  message: string
): CouponResult {
  return {
    valid: false,
    code,
    discountPercent: 0,
    discountAmount: 0,
    finalAmount: originalAmount,
    message,
  };
}

export async function validateCoupon(
  code: string,
  originalAmount: number,
  context: ValidateCouponContext = {}
): Promise<CouponResult> {
  const cleanCode = (code || "").trim().toUpperCase();

  if (!cleanCode) {
    return invalidResult("", originalAmount, "Por favor ingresa un código de cupón.");
  }

  try {
    await ensureDefaultCoupons();
  } catch {
    // Si la tabla aún no existe en algún entorno, fallamos con mensaje claro
  }

  const coupon = await prisma.coupon.findUnique({ where: { code: cleanCode } });

  if (!coupon || !coupon.isActive) {
    return invalidResult(
      cleanCode,
      originalAmount,
      "El cupón ingresado no es válido o ha expirado."
    );
  }

  const cartIds = (context.cursoIds ?? []).filter(Boolean);
  const itemCount = context.itemCount ?? (cartIds.length > 0 ? cartIds.length : 1);

  const scope = matchesCouponScope(coupon, cartIds, itemCount);
  if (!scope.ok) {
    return invalidResult(cleanCode, originalAmount, scope.message!);
  }

  const discountAmount =
    Math.round(((originalAmount * coupon.discountPercent) / 100) * 100) / 100;
  const finalAmount = Math.max(0, Math.round((originalAmount - discountAmount) * 100) / 100);

  const description =
    coupon.description || `Descuento del ${coupon.discountPercent}%`;

  return {
    valid: true,
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    discountAmount,
    finalAmount,
    message: `${description} aplicado con éxito (-${coupon.discountPercent}%).`,
  };
}

export async function listCoupons(): Promise<CouponRecord[]> {
  await requireAdmin();
  await ensureDefaultCoupons();
  return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
}

export async function listFormationsForCoupons() {
  await requireAdmin();
  return prisma.curso.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      category: true,
      isLive: true,
    },
    orderBy: [{ isLive: "asc" }, { title: "asc" }],
  });
}

export type CouponInput = {
  code: string;
  description?: string;
  discountPercent: number;
  minItems: number;
  applyMode: CouponApplyMode;
  cursoIds: string[];
  isActive?: boolean;
};

export async function createCoupon(input: CouponInput) {
  await requireAdmin();
  const code = input.code.trim().toUpperCase();
  if (!code) return { error: "El código es obligatorio" };
  if (!(input.discountPercent > 0 && input.discountPercent <= 100)) {
    return { error: "El descuento debe estar entre 1 y 100" };
  }
  if (input.minItems < 1) return { error: "La cantidad mínima de ítems debe ser al menos 1" };

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: input.description?.trim() || null,
        discountPercent: input.discountPercent,
        minItems: input.minItems,
        applyMode: input.applyMode === "ALL" ? "ALL" : "ANY",
        cursoIds: input.cursoIds,
        isActive: input.isActive ?? true,
      },
    });
    revalidatePath("/dashboard/cupones");
    return { coupon };
  } catch {
    return { error: "No se pudo crear el cupón. ¿El código ya existe?" };
  }
}

export async function updateCoupon(id: string, input: CouponInput) {
  await requireAdmin();
  const code = input.code.trim().toUpperCase();
  if (!code) return { error: "El código es obligatorio" };
  if (!(input.discountPercent > 0 && input.discountPercent <= 100)) {
    return { error: "El descuento debe estar entre 1 y 100" };
  }
  if (input.minItems < 1) return { error: "La cantidad mínima de ítems debe ser al menos 1" };

  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code,
        description: input.description?.trim() || null,
        discountPercent: input.discountPercent,
        minItems: input.minItems,
        applyMode: input.applyMode === "ALL" ? "ALL" : "ANY",
        cursoIds: input.cursoIds,
        isActive: input.isActive ?? true,
      },
    });
    revalidatePath("/dashboard/cupones");
    return { coupon };
  } catch {
    return { error: "No se pudo actualizar el cupón." };
  }
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/dashboard/cupones");
  return { success: true };
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.coupon.update({ where: { id }, data: { isActive } });
  revalidatePath("/dashboard/cupones");
  return { success: true };
}
