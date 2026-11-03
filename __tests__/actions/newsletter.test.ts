import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findMany: vi.fn() },
    whatsAppNotification: { createMany: vi.fn() },
    newsletterSubscriber: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendNewsletterEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({
    allowed: true,
    remaining: 2,
    retryAfterSeconds: 0,
  })),
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  sendNewsletter,
  subscribeToNewsletter,
  unsubscribeByToken,
} from "@/lib/actions/newsletter";

const mockPrisma = prisma as unknown as {
  user: { findMany: ReturnType<typeof vi.fn> };
  whatsAppNotification: { createMany: ReturnType<typeof vi.fn> };
  newsletterSubscriber: {
    upsert: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
};

describe("subscribeToNewsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.whatsAppNotification.createMany.mockResolvedValue({ count: 0 });
    vi.mocked(rateLimit).mockReturnValue({
      allowed: true,
      remaining: 2,
      retryAfterSeconds: 0,
    });
  });

  it("valida formato de email", async () => {
    expect(await subscribeToNewsletter("no-es-email")).toEqual({
      error: "Email inválido.",
    });
  });

  it("hace upsert normalizando el email", async () => {
    mockPrisma.newsletterSubscriber.upsert.mockResolvedValue({});
    expect(await subscribeToNewsletter("Ana@Test.COM", "Ana")).toEqual({
      success: true,
    });
    expect(mockPrisma.newsletterSubscriber.upsert).toHaveBeenCalledWith({
      where: { email: "ana@test.com" },
      update: { isActive: true, name: "Ana" },
      create: { email: "ana@test.com", name: "Ana" },
    });
  });
});

describe("unsubscribeByToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rateLimit).mockReturnValue({
      allowed: true,
      remaining: 9,
      retryAfterSeconds: 0,
    });
  });

  it("valida token", async () => {
    expect(await unsubscribeByToken("corto")).toEqual({
      error: "Token inválido.",
    });
  });

  it("desactiva suscriptor existente", async () => {
    mockPrisma.newsletterSubscriber.findUnique.mockResolvedValue({
      token: "abcdef1234567890abcd",
    });
    mockPrisma.newsletterSubscriber.update.mockResolvedValue({});

    expect(await unsubscribeByToken("abcdef1234567890abcd")).toEqual({
      success: true,
    });
  });
});

describe("sendNewsletter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.whatsAppNotification.createMany.mockResolvedValue({ count: 0 });
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin", role: "ADMIN" },
    } as never);
  });

  it("exige contenido y suscriptores activos", async () => {
    expect(await sendNewsletter("", "t", "", "html")).toEqual({
      error: "Asunto, título y contenido son obligatorios.",
    });

    mockPrisma.newsletterSubscriber.findMany.mockResolvedValue([]);
    expect(await sendNewsletter("Asunto", "Título", "", "<p>Hola</p>")).toEqual(
      {
        error: "No hay suscriptores activos ni clientes con WhatsApp autorizado.",
      },
    );
  });

  it("envía a todos los activos", async () => {
    mockPrisma.newsletterSubscriber.findMany.mockResolvedValue([
      { email: "a@test.com", name: "A", token: "tok1tok1tok1tok1tok1" },
      { email: "b@test.com", name: "B", token: "tok2tok2tok2tok2tok2" },
    ]);

    expect(
      await sendNewsletter("Promo", "Hola", "pre", "<p>x</p>"),
    ).toEqual({ success: true, sent: 2, failed: 0, total: 2, whatsappQueued: 0 });
  });
  it("encola novedades solo para compradores autorizados", async () => {
    mockPrisma.newsletterSubscriber.findMany.mockResolvedValue([]);
    mockPrisma.user.findMany.mockResolvedValue([{ id: "u1", whatsappNumber: "+584121234567" }]);
    mockPrisma.whatsAppNotification.createMany.mockResolvedValue({ count: 1 });
    const result = await sendNewsletter("Promo", "Nuevos cursos", "", "<p>Hola</p>");
    expect(result).toMatchObject({ success: true, whatsappQueued: 1 });
    expect(mockPrisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ whatsappMarketing: true, inscripciones: { some: { status: "APPROVED" } } }) }));
    expect(mockPrisma.whatsAppNotification.createMany).toHaveBeenCalledWith({ data: [expect.objectContaining({ phone: "584121234567", kind: "MARKETING" })] });
  });
});
