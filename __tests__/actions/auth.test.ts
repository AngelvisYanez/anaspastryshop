import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({
  logActivity: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/email", () => ({
  sendWelcomeEmail: vi.fn(() => Promise.resolve()),
  sendPasswordResetEmail: vi.fn(() => Promise.resolve()),
  sendAdminNewUserEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(() => ({
    allowed: true,
    remaining: 10,
    retryAfterSeconds: 0,
  })),
}));

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  checkPreloginStatus,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "@/lib/actions/auth";

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  passwordResetToken: {
    create: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
};

function form(data: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

describe("registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rateLimit).mockReturnValue({
      allowed: true,
      remaining: 4,
      retryAfterSeconds: 0,
    });
  });

  it("valida campos obligatorios y longitud de contraseña", async () => {
    expect(await registerUser(form({ name: "", email: "", password: "" }))).toEqual({
      error: "Todos los campos son obligatorios",
    });
    expect(
      await registerUser(
        form({ name: "Ana", email: "ana@test.com", password: "short" }),
      ),
    ).toEqual({ error: "La contraseña debe tener al menos 8 caracteres" });
  });

  it("bloquea por rate limit", async () => {
    vi.mocked(rateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
    });
    expect(
      await registerUser(
        form({ name: "Ana", email: "ana@test.com", password: "password1" }),
      ),
    ).toEqual({ error: "Demasiados intentos. Intenta de nuevo más tarde." });
  });

  it("rechaza email duplicado", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: "1", email: "ana@test.com" });
    expect(
      await registerUser(
        form({ name: "Ana", email: "Ana@Test.com", password: "password1" }),
      ),
    ).toEqual({ error: "El correo ya está registrado" });
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "ana@test.com" },
    });
  });

  it("crea usuario USER con éxito", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: "u1",
      email: "ana@test.com",
      name: "Ana",
      role: "USER",
    });

    const result = await registerUser(
      form({ name: "Ana", email: "ana@test.com", password: "password1" }),
    );
    expect(result).toEqual({ success: true });
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: "ana@test.com",
          role: "USER",
        }),
      }),
    );
  });
});

describe("checkPreloginStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("detecta cuenta suspendida con credenciales válidas", async () => {
    const bcrypt = await import("bcryptjs");
    const password = await bcrypt.hash("password1", 4);
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "ana@test.com",
      password,
      isActive: false,
      deactivationReason: "Impago",
    });

    const result = await checkPreloginStatus(
      form({ email: "ana@test.com", password: "password1" }),
    );
    expect(result).toEqual({ isSuspended: true, reason: "Impago" });
  });

  it("no marca suspensión con password incorrecto", async () => {
    const bcrypt = await import("bcryptjs");
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "ana@test.com",
      password: await bcrypt.hash("password1", 4),
      isActive: false,
      deactivationReason: "x",
    });

    expect(
      await checkPreloginStatus(
        form({ email: "ana@test.com", password: "wrongpass" }),
      ),
    ).toEqual({ isSuspended: false });
  });
});

describe("requestPasswordReset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rateLimit).mockReturnValue({
      allowed: true,
      remaining: 2,
      retryAfterSeconds: 0,
    });
  });

  it("exige email", async () => {
    expect(await requestPasswordReset(form({}))).toEqual({
      error: "El correo es obligatorio",
    });
  });

  it("responde success aunque el email no exista (anti-enumeration)", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    expect(
      await requestPasswordReset(form({ email: "ghost@test.com" })),
    ).toEqual({ success: true });
    expect(mockPrisma.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it("crea token si el usuario existe", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "ana@test.com",
      name: "Ana",
    });
    mockPrisma.passwordResetToken.create.mockResolvedValue({});

    expect(
      await requestPasswordReset(form({ email: "Ana@Test.com" })),
    ).toEqual({ success: true });
    expect(mockPrisma.passwordResetToken.create).toHaveBeenCalled();
  });
});

describe("resetPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(rateLimit).mockReturnValue({
      allowed: true,
      remaining: 9,
      retryAfterSeconds: 0,
    });
  });

  it("valida coincidencia y longitud", async () => {
    expect(
      await resetPassword(
        form({ token: "t", password: "password1", confirmPassword: "other" }),
      ),
    ).toEqual({ error: "Las contraseñas no coinciden" });

    expect(
      await resetPassword(
        form({ token: "t", password: "short", confirmPassword: "short" }),
      ),
    ).toEqual({ error: "La contraseña debe tener al menos 8 caracteres" });
  });

  it("rechaza token expirado o usado", async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      token: "t",
      email: "ana@test.com",
      used: true,
      expiresAt: new Date(Date.now() + 60_000),
    });
    expect(
      await resetPassword(
        form({
          token: "t",
          password: "password1",
          confirmPassword: "password1",
        }),
      ),
    ).toMatchObject({ error: expect.stringMatching(/no es válido|expirado/i) });
  });

  it("actualiza password y marca token usado", async () => {
    mockPrisma.passwordResetToken.findUnique.mockResolvedValue({
      token: "t",
      email: "ana@test.com",
      used: false,
      expiresAt: new Date(Date.now() + 60_000),
    });
    mockPrisma.user.update.mockResolvedValue({});
    mockPrisma.passwordResetToken.update.mockResolvedValue({});

    expect(
      await resetPassword(
        form({
          token: "t",
          password: "password1",
          confirmPassword: "password1",
        }),
      ),
    ).toEqual({ success: true });

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: "ana@test.com" } }),
    );
    expect(mockPrisma.passwordResetToken.update).toHaveBeenCalledWith({
      where: { token: "t" },
      data: { used: true },
    });
  });
});
