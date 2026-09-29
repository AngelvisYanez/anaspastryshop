import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inscription: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({
    allowed: true,
    remaining: 4,
    retryAfterSeconds: 0,
  })),
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  createBulkCourseInscriptions,
  createCourseInscription,
  createPastryServicePayment,
} from "@/lib/actions/inscription";

const mockPrisma = prisma as unknown as {
  inscription: {
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    createMany: ReturnType<typeof vi.fn>;
  };
};

describe("createCourseInscription", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", role: "USER" },
    } as never);
  });

  it("exige sesión", async () => {
    vi.mocked(auth).mockResolvedValue(null as never);
    expect(
      await createCourseInscription({
        cursoId: "c1",
        method: "ZELLE",
        amountPaid: 45,
      }),
    ).toMatchObject({ error: expect.stringMatching(/iniciar sesión/i) });
  });

  it("exige curso", async () => {
    expect(
      await createCourseInscription({
        cursoId: "",
        method: "ZELLE",
        amountPaid: 45,
      }),
    ).toMatchObject({ error: expect.stringMatching(/válido/i) });
  });

  it("bloquea inscripción duplicada APPROVED o PENDING", async () => {
    mockPrisma.inscription.findFirst.mockResolvedValue({
      id: "i1",
      status: "APPROVED",
    });
    expect(
      await createCourseInscription({
        cursoId: "c1",
        method: "ZELLE",
        amountPaid: 45,
      }),
    ).toMatchObject({ error: expect.stringMatching(/acceso activo/i) });

    mockPrisma.inscription.findFirst.mockResolvedValue({
      id: "i2",
      status: "PENDING",
    });
    expect(
      await createCourseInscription({
        cursoId: "c1",
        method: "PAGO_MOVIL",
        amountPaid: 45,
        phoneNumber: "04121234567",
      }),
    ).toMatchObject({ error: expect.stringMatching(/pendiente/i) });
  });

  it("crea inscripción PENDING", async () => {
    mockPrisma.inscription.findFirst.mockResolvedValue(null);
    mockPrisma.inscription.create.mockResolvedValue({ id: "ins-1" });

    const result = await createCourseInscription({
      cursoId: "c1",
      method: "ZELLE",
      amountPaid: 45,
      reference: "ABC",
      receiptImage: "data:image/png;base64,x",
    });

    expect(result).toEqual({ success: true, inscriptionId: "ins-1" });
    expect(mockPrisma.inscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          cursoId: "c1",
          status: "PENDING",
          method: "ZELLE",
        }),
      }),
    );
  });
});

describe("createPastryServicePayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", role: "USER" },
    } as never);
    vi.mocked(rateLimit).mockReturnValue({
      allowed: true,
      remaining: 4,
      retryAfterSeconds: 0,
    });
  });

  it("formatea referencia con descripción del servicio", async () => {
    mockPrisma.inscription.create.mockResolvedValue({ id: "p1" });

    const result = await createPastryServicePayment({
      serviceDescription: "Torta de boda 3 pisos",
      method: "BINANCE",
      reference: "TX99",
      amountPaid: 200,
      receiptImage: "img",
    });

    expect(result).toEqual({ success: true, inscriptionId: "p1" });
    expect(mockPrisma.inscription.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          cursoId: null,
          reference: "[Servicio: Torta de boda 3 pisos] TX99",
          status: "PENDING",
        }),
      }),
    );
  });

  it("respeta rate limit", async () => {
    vi.mocked(rateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 100,
    });
    expect(
      await createPastryServicePayment({
        serviceDescription: "Cupcakes",
        method: "ZELLE",
        amountPaid: 50,
      }),
    ).toMatchObject({ error: expect.stringMatching(/Demasiados/i) });
  });
});

describe("createBulkCourseInscriptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", role: "USER" },
    } as never);
  });

  it("exige ítems en la bolsa", async () => {
    expect(
      await createBulkCourseInscriptions({
        items: [],
        method: "ZELLE",
      }),
    ).toMatchObject({ error: expect.stringMatching(/bolsa/i) });
  });

  it("omite cursos ya inscritos y crea el resto", async () => {
    mockPrisma.inscription.findMany.mockResolvedValue([{ cursoId: "c1" }]);
    mockPrisma.inscription.createMany.mockResolvedValue({ count: 1 });

    const result = await createBulkCourseInscriptions({
      items: [
        { cursoId: "c1", amountPaid: 45 },
        { cursoId: "c2", amountPaid: 35 },
      ],
      method: "ZELLE",
      reference: "BAG-1",
    });

    expect(result).toEqual({
      success: true,
      inscriptionIds: ["c2"],
      alreadyEnrolled: ["c1"],
    });
    expect(mockPrisma.inscription.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          cursoId: "c2",
          amountPaid: 35,
          userId: "user-1",
          status: "PENDING",
        }),
      ],
    });
  });

  it("falla si todos ya estaban inscritos", async () => {
    mockPrisma.inscription.findMany.mockResolvedValue([
      { cursoId: "c1" },
      { cursoId: "c2" },
    ]);

    const result = await createBulkCourseInscriptions({
      items: [
        { cursoId: "c1", amountPaid: 45 },
        { cursoId: "c2", amountPaid: 35 },
      ],
      method: "ZELLE",
    });

    expect(result).toMatchObject({
      error: expect.stringMatching(/todas las formaciones/i),
      alreadyEnrolled: ["c1", "c2"],
    });
    expect(mockPrisma.inscription.createMany).not.toHaveBeenCalled();
  });
});
