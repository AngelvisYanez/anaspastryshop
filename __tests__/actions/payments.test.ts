import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    inscription: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
    },
    curso: {
      findUnique: vi.fn(),
    },
    coursePurchase: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/email", () => ({
  sendCoursePurchaseEmail: vi.fn(() => Promise.resolve()),
  sendPaymentRejectedEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  approvePayment,
  getPaymentStats,
  getPendingPayments,
  rejectPayment,
} from "@/lib/actions/payments";
import { sendCoursePurchaseEmail, sendPaymentRejectedEmail } from "@/lib/email";
import { checkUserCourseAccess } from "@/app/cursos/[slug]/checkUserCourseAccess";

const mockPrisma = prisma as unknown as {
  inscription: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    aggregate: ReturnType<typeof vi.fn>;
  };
  curso: { findUnique: ReturnType<typeof vi.fn> };
  coursePurchase: { findFirst: ReturnType<typeof vi.fn> };
};

describe("payments admin flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    } as never);
  });

  it("getPendingPayments exige ADMIN", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "USER" },
    } as never);
    await expect(getPendingPayments()).rejects.toThrow(/No autorizado/);
  });

  it("lista pagos PENDING", async () => {
    mockPrisma.inscription.findMany.mockResolvedValue([{ id: "i1" }]);
    expect(await getPendingPayments()).toEqual({
      inscriptions: [{ id: "i1" }],
    });
  });

  it("approvePayment aprueba curso y envía email", async () => {
    mockPrisma.inscription.findUnique.mockResolvedValue({
      id: "i1",
      cursoId: "c1",
      amountPaid: 45,
      user: { id: "u1", email: "a@test.com", name: "Ana" },
    });
    mockPrisma.inscription.update.mockResolvedValue({});
    mockPrisma.curso.findUnique.mockResolvedValue({ title: "Cake de Piña" });

    expect(await approvePayment("i1")).toEqual({ success: true });
    expect(mockPrisma.inscription.update).toHaveBeenCalledWith({
      where: { id: "i1" },
      data: { status: "APPROVED" },
    });
    expect(sendCoursePurchaseEmail).toHaveBeenCalledWith(
      "a@test.com",
      "Ana",
      "Cake de Piña",
    );
  });

  it("approvePayment en pastelería no busca curso", async () => {
    mockPrisma.inscription.findUnique.mockResolvedValue({
      id: "i2",
      cursoId: null,
      amountPaid: 100,
      user: { id: "u1", email: "a@test.com", name: "Ana" },
    });
    mockPrisma.inscription.update.mockResolvedValue({});

    expect(await approvePayment("i2")).toEqual({ success: true });
    expect(mockPrisma.curso.findUnique).not.toHaveBeenCalled();
    expect(sendCoursePurchaseEmail).not.toHaveBeenCalled();
  });

  it("rejectPayment marca REJECTED y notifica", async () => {
    mockPrisma.inscription.findUnique.mockResolvedValue({
      id: "i3",
      cursoId: "c1",
      user: { email: "a@test.com", name: "Ana" },
      curso: { title: "Merengue" },
    });
    mockPrisma.inscription.update.mockResolvedValue({});

    expect(await rejectPayment("i3", "Comprobante ilegible")).toEqual({
      success: true,
    });
    expect(mockPrisma.inscription.update).toHaveBeenCalledWith({
      where: { id: "i3" },
      data: { status: "REJECTED" },
    });
    expect(sendPaymentRejectedEmail).toHaveBeenCalled();
  });

  it("getPaymentStats agrega contadores", async () => {
    mockPrisma.inscription.count
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(1);
    mockPrisma.inscription.aggregate.mockResolvedValue({
      _sum: { amountPaid: 250 },
    });

    expect(await getPaymentStats()).toEqual({
      pending: 2,
      approved: 5,
      rejected: 1,
      totalApprovedAmount: 250,
    });
  });
});

describe("checkUserCourseAccess", () => {
  beforeEach(() => vi.clearAllMocks());

  it("niega acceso sin userId", async () => {
    expect(
      await checkUserCourseAccess({ courseId: "c1", userId: null }),
    ).toBe(false);
  });

  it("permite ADMIN e instructor", async () => {
    expect(
      await checkUserCourseAccess({
        userId: "admin",
        role: "ADMIN",
        courseId: "c1",
      }),
    ).toBe(true);

    expect(
      await checkUserCourseAccess({
        userId: "teacher",
        role: "USER",
        courseId: "c1",
        instructorId: "teacher",
      }),
    ).toBe(true);
    expect(mockPrisma.inscription.findFirst).not.toHaveBeenCalled();
  });

  it("permite inscripción APPROVED o compra COMPLETED", async () => {
    mockPrisma.inscription.findFirst.mockResolvedValue({ id: "i1" });
    expect(
      await checkUserCourseAccess({
        userId: "u1",
        role: "USER",
        courseId: "c1",
      }),
    ).toBe(true);

    mockPrisma.inscription.findFirst.mockResolvedValue(null);
    mockPrisma.coursePurchase.findFirst.mockResolvedValue({ id: "p1" });
    expect(
      await checkUserCourseAccess({
        userId: "u1",
        role: "USER",
        courseId: "c1",
      }),
    ).toBe(true);

    mockPrisma.coursePurchase.findFirst.mockResolvedValue(null);
    expect(
      await checkUserCourseAccess({
        userId: "u1",
        role: "USER",
        courseId: "c1",
      }),
    ).toBe(false);
  });
});
