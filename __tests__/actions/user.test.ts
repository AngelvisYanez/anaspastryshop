import { beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    curso: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    liveStream: { updateMany: vi.fn() },
    webinar: { updateMany: vi.fn() },
    coursePurchase: { deleteMany: vi.fn() },
    inscription: { deleteMany: vi.fn() },
    activityLog: { deleteMany: vi.fn() },
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

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  adminDeleteUser,
  adminEditUser,
  adminToggleUserStatus,
  updateProfile,
} from "@/lib/actions/user";

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  curso: {
    findMany: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
  };
  liveStream: { updateMany: ReturnType<typeof vi.fn> };
  webinar: { updateMany: ReturnType<typeof vi.fn> };
  coursePurchase: { deleteMany: ReturnType<typeof vi.fn> };
  inscription: { deleteMany: ReturnType<typeof vi.fn> };
  activityLog: { deleteMany: ReturnType<typeof vi.fn> };
};

function form(data: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) fd.set(k, v);
  return fd;
}

describe("updateProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "USER" },
    } as never);
  });

  it("rechaza imágenes data: URL (cookies JWT / HTTP 431)", async () => {
    const result = await updateProfile(
      form({
        name: "Ana",
        image: "data:image/png;base64,aaaa",
        newPassword: "",
      }),
    );
    expect(result).toEqual({
      error: "Usa una URL de imagen (no un archivo embebido en base64).",
    });
  });

  it("actualiza nombre e imagen por URL", async () => {
    mockPrisma.user.update.mockResolvedValue({});
    expect(
      await updateProfile(
        form({
          name: "Ana Flores",
          image: "https://cdn.example.com/avatar.png",
          newPassword: "",
        }),
      ),
    ).toEqual({ success: true });
  });

  it("guarda una foto optimizada y una ruta corta en la misma actualización", async () => {
    const image = await sharp({
      create: { width: 900, height: 700, channels: 3, background: "#f5ced9" },
    }).png().toBuffer();
    const fields = form({ name: "Ana" });
    fields.set("avatar", new File([Uint8Array.from(image)], "foto.png", { type: "image/png" }));

    expect(await updateProfile(fields)).toEqual({ success: true });
    const [{ where, data }] = mockPrisma.user.update.mock.calls[0];
    expect(where).toEqual({ id: "u1" });
    expect(data.image).toMatch(/^\/api\/profile-avatar\/u1\?v=[a-f0-9-]+$/);
    expect(data.avatar.upsert.update.data).toEqual(data.avatar.upsert.create.data);
    expect(await sharp(data.avatar.upsert.create.data).metadata()).toMatchObject({
      format: "webp", width: 512, height: 512,
    });
  });

  it("rechaza un archivo ilegible aunque declare un tipo de imagen", async () => {
    const fields = form({ name: "Ana" });
    fields.set("avatar", new File(["<!doctype html>"], "foto.png", { type: "image/png" }));

    expect(await updateProfile(fields)).toHaveProperty("error");
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });

  it("conserva la foto actual al editar los datos sin adjuntar una imagen", async () => {
    await updateProfile(form({ name: "Ana" }));
    expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: "u1" }, data: { name: "Ana" } });
  });
});

describe("adminEditUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({ user: { id: "admin-1", role: "ADMIN" } } as never);
  });

  it("guarda contacto y acceso junto con la foto del usuario editado", async () => {
    const image = await sharp({ create: { width: 48, height: 48, channels: 3, background: "#fff" } }).png().toBuffer();
    const fields = form({
      name: " Ana ", email: " ANA@EXAMPLE.COM ", role: "USER", isActive: "false",
      deactivationReason: "Solicitud de la usuaria", whatsappNumber: "+58 (412) 123-4567",
      whatsappMarketing: "on", isApproved: "on",
    });
    fields.set("avatar", new File([Uint8Array.from(image)], "foto.png", { type: "image/png" }));

    expect(await adminEditUser("u1", fields)).toEqual({ success: true });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: expect.objectContaining({
        name: "Ana", email: "ana@example.com", role: "USER", isActive: false,
        deactivationReason: "Solicitud de la usuaria", whatsappNumber: "+584121234567",
        whatsappMarketing: true, isApproved: true,
        image: expect.stringContaining("/api/profile-avatar/u1?v="),
        avatar: expect.objectContaining({ upsert: expect.any(Object) }),
      }),
    });
  });

  it("protege el rol y el acceso de la propia cuenta administradora", async () => {
    const fields = form({ name: "Admin", email: "admin@example.com", role: "USER", isActive: "true" });
    expect(await adminEditUser("admin-1", fields)).toHaveProperty("error");
    expect(mockPrisma.user.update).not.toHaveBeenCalled();
  });
});

describe("adminDeleteUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    } as never);
  });

  it("impide autoeliminación", async () => {
    expect(await adminDeleteUser("admin-1")).toEqual({
      error: "No puedes eliminarte a ti mismo.",
    });
  });

  it("transfiere cursos del instructor y elimina al usuario", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u2",
      email: "u2@test.com",
      role: "USER",
      _count: { inscripciones: 0 },
    });
    mockPrisma.curso.findMany.mockResolvedValue([{ id: "c1" }]);
    mockPrisma.curso.updateMany.mockResolvedValue({ count: 1 });
    mockPrisma.liveStream.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.webinar.updateMany.mockResolvedValue({ count: 0 });
    mockPrisma.coursePurchase.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.inscription.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.activityLog.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.user.delete.mockResolvedValue({});

    await adminDeleteUser("u2");

    expect(mockPrisma.curso.updateMany).toHaveBeenCalledWith({
      where: { instructorId: "u2" },
      data: { instructorId: "admin-1" },
    });
    expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "u2" } });
  });
});

describe("adminToggleUserStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    } as never);
  });

  it("solo suspende usuarios con rol USER", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "a2",
      role: "ADMIN",
      email: "a2@test.com",
    });
    expect(await adminToggleUserStatus("a2", false, "x")).toEqual({
      error:
        "Solo se puede desactivar o reactivar a alumnos (usuarios con rol USER).",
    });
  });

  it("suspende alumno con motivo", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "u2",
      role: "USER",
      email: "u2@test.com",
    });
    mockPrisma.user.update.mockResolvedValue({});

    expect(await adminToggleUserStatus("u2", false, "Impago")).toEqual({
      success: true,
    });
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "u2" },
      data: expect.objectContaining({
        isActive: false,
        deactivationReason: "Impago",
      }),
    });
  });
});
