import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    coupon: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    curso: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCoupon, validateCoupon } from "@/lib/actions/coupons";
import { matchesCouponScope } from "@/lib/coupons/matches-scope";

const mockPrisma = prisma as unknown as {
  coupon: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  curso: { findMany: ReturnType<typeof vi.fn> };
};

describe("matchesCouponScope", () => {
  it("rechaza si faltan ítems mínimos", () => {
    const result = matchesCouponScope(
      { minItems: 2, applyMode: "ANY", cursoIds: [] },
      ["a"],
      1,
    );
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/al menos 2/);
  });

  it("ALL exige todas las formaciones configuradas", () => {
    const missing = matchesCouponScope(
      { minItems: 2, applyMode: "ALL", cursoIds: ["c1", "c2"] },
      ["c1"],
      1,
    );
    expect(missing.ok).toBe(false);

    const ok = matchesCouponScope(
      { minItems: 2, applyMode: "ALL", cursoIds: ["c1", "c2"] },
      ["c1", "c2"],
      2,
    );
    expect(ok.ok).toBe(true);
  });

  it("ANY sin restricción de cursos aplica con minItems", () => {
    expect(
      matchesCouponScope(
        { minItems: 1, applyMode: "ANY", cursoIds: [] },
        ["x"],
        1,
      ).ok,
    ).toBe(true);
  });

  it("ANY restringido exige coincidencias suficientes", () => {
    const fail = matchesCouponScope(
      { minItems: 2, applyMode: "ANY", cursoIds: ["c1", "c2", "c3"] },
      ["c1"],
      1,
    );
    expect(fail.ok).toBe(false);

    const ok = matchesCouponScope(
      { minItems: 2, applyMode: "ANY", cursoIds: ["c1", "c2", "c3"] },
      ["c1", "c3"],
      2,
    );
    expect(ok.ok).toBe(true);
  });
});

describe("validateCoupon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.curso.findMany.mockResolvedValue([]);
  });

  it("rechaza código vacío", async () => {
    const result = await validateCoupon("  ", 100);
    expect(result.valid).toBe(false);
    expect(result.finalAmount).toBe(100);
    expect(result.message).toMatch(/ingresa un código/i);
  });

  it("rechaza cupón inexistente o inactivo", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue(null);
    const missing = await validateCoupon("NOPE", 100);
    expect(missing.valid).toBe(false);

    mockPrisma.coupon.findUnique.mockResolvedValue({
      code: "OLD",
      isActive: false,
      discountPercent: 20,
      minItems: 1,
      applyMode: "ANY",
      cursoIds: [],
      description: null,
    });
    const inactive = await validateCoupon("old", 100);
    expect(inactive.valid).toBe(false);
  });

  it("calcula descuento porcentual redondeado", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      code: "ANAPASTELERA",
      isActive: true,
      discountPercent: 20,
      minItems: 1,
      applyMode: "ANY",
      cursoIds: [],
      description: "20% especial",
    });

    const result = await validateCoupon("anapastelera", 99.99, {
      cursoIds: ["any"],
      itemCount: 1,
    });

    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(20);
    expect(result.discountAmount).toBe(20);
    expect(result.finalAmount).toBe(79.99);
    expect(result.message).toMatch(/aplicado con éxito/);
  });

  it("aplica reglas ALL del paquete online", async () => {
    mockPrisma.coupon.findUnique.mockResolvedValue({
      code: "TODOSLOSCURSOS",
      isActive: true,
      discountPercent: 40,
      minItems: 2,
      applyMode: "ALL",
      cursoIds: ["online-1", "online-2"],
      description: "Paquete 40%",
    });

    const incomplete = await validateCoupon("TODOSLOSCURSOS", 80, {
      cursoIds: ["online-1"],
      itemCount: 1,
    });
    expect(incomplete.valid).toBe(false);

    const complete = await validateCoupon("TODOSLOSCURSOS", 80, {
      cursoIds: ["online-1", "online-2"],
      itemCount: 2,
    });
    expect(complete.valid).toBe(true);
    expect(complete.discountAmount).toBe(32);
    expect(complete.finalAmount).toBe(48);
  });
});

describe("createCoupon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin", role: "ADMIN" },
    } as never);
  });

  it("valida inputs de administración", async () => {
    expect(
      await createCoupon({
        code: "  ",
        discountPercent: 10,
        minItems: 1,
        applyMode: "ANY",
        cursoIds: [],
      }),
    ).toEqual({ error: "El código es obligatorio" });

    expect(
      await createCoupon({
        code: "TEST",
        discountPercent: 0,
        minItems: 1,
        applyMode: "ANY",
        cursoIds: [],
      }),
    ).toEqual({ error: "El descuento debe estar entre 1 y 100" });

    expect(
      await createCoupon({
        code: "TEST",
        discountPercent: 10,
        minItems: 0,
        applyMode: "ANY",
        cursoIds: [],
      }),
    ).toEqual({ error: "La cantidad mínima de ítems debe ser al menos 1" });
  });

  it("crea cupón normalizado en mayúsculas", async () => {
    mockPrisma.coupon.create.mockResolvedValue({
      id: "1",
      code: "PROMO10",
    });

    const result = await createCoupon({
      code: "promo10",
      discountPercent: 10,
      minItems: 1,
      applyMode: "ANY",
      cursoIds: [],
    });

    expect(result).toHaveProperty("coupon");
    expect(mockPrisma.coupon.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: "PROMO10", discountPercent: 10 }),
      }),
    );
  });

  it("bloquea a no-admin", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "USER" },
    } as never);
    await expect(
      createCoupon({
        code: "X",
        discountPercent: 10,
        minItems: 1,
        applyMode: "ANY",
        cursoIds: [],
      }),
    ).rejects.toThrow(/No autorizado/);
  });
});
