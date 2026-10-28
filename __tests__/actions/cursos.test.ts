import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    curso: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    courseModule: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(async (ops: unknown) => ops),
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCourse, deleteCourse, updateCourse } from "@/lib/actions/cursos";
import type { CoursePayload } from "@/lib/actions/cursos";

const mockPrisma = prisma as unknown as {
  curso: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  courseModule: { deleteMany: ReturnType<typeof vi.fn> };
  $transaction: ReturnType<typeof vi.fn>;
};

const basePayload: CoursePayload = {
  title: "Taller de Fondant",
  description: "Aprende fondant",
  price: 80,
  totalHours: 8,
  totalClasses: 0,
  language: "Español",
  level: "Desde Cero",
  isLive: true,
  status: "PUBLISHED",
  location: "Coro",
  workshopDate: "2026-10-22",
  workshopTime: "2:00 PM",
  modules: [
    {
      title: "Módulo 1",
      lessons: [{ title: "Introducción" }, { title: "Práctica" }],
    },
  ],
};

describe("cursos admin flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue({
      user: { id: "admin-1", role: "ADMIN" },
    } as never);
  });

  it("createCourse exige ADMIN", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "u1", role: "USER" },
    } as never);
    await expect(createCourse(basePayload)).rejects.toThrow(/No autorizado/);
  });

  it("crea curso con slug y totalClasses derivados", async () => {
    mockPrisma.curso.findUnique.mockResolvedValue(null);
    mockPrisma.curso.create.mockResolvedValue({ id: "course-1" });

    const result = await createCourse(basePayload);
    expect(result).toEqual({ success: true, courseId: "course-1" });
    expect(mockPrisma.curso.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Taller de Fondant",
          slug: "taller-de-fondant",
          totalClasses: 2,
          isLive: true,
          instructorId: "admin-1",
        }),
      }),
    );
  });

  it("deleteCourse falla si no existe", async () => {
    mockPrisma.curso.findUnique.mockResolvedValue(null);
    expect(await deleteCourse("missing")).toEqual({
      error: "Curso no encontrado",
    });
  });

  it("deleteCourse elimina curso existente", async () => {
    mockPrisma.curso.findUnique.mockResolvedValue({
      id: "c1",
      _count: { inscritos: 0 },
    });
    mockPrisma.curso.delete.mockResolvedValue({});
    expect(await deleteCourse("c1")).toEqual({ success: true });
  });

  it("updateCourse no cambia precio si hay inscritos", async () => {
    mockPrisma.curso.findUnique
      .mockResolvedValueOnce({
        id: "c1",
        slug: "taller-de-fondant",
        price: 80,
        _count: { inscritos: 3 },
      })
      // slugTaken check
      .mockResolvedValue(null);
    mockPrisma.curso.update.mockResolvedValue({});
    mockPrisma.courseModule.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.$transaction.mockImplementation(async (ops: unknown[]) => {
      await Promise.all(ops as Promise<unknown>[]);
      return ops;
    });

    const result = await updateCourse("c1", {
      ...basePayload,
      price: 999,
      title: "Taller de Fondant Actualizado",
    });

    expect(result).toEqual({ success: true });
    expect(mockPrisma.curso.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          price: 80,
          title: "Taller de Fondant Actualizado",
        }),
      }),
    );
  });

  it("al cambiar la fecha conserva el slug y los datos del workshop", async () => {
    mockPrisma.curso.findUnique.mockResolvedValue({
      id: "c1",
      slug: null,
      title: "WORKSHOP TORTAS BÁSICAS",
      price: 70,
      content: JSON.stringify({
        isWorkshop: true,
        slug: "workshop-tortas-basicas",
        workshopDate: "2026-10-04",
        realizaremos: ["Torta de vainilla"],
      }),
      _count: { inscritos: 0 },
    });
    mockPrisma.curso.update.mockResolvedValue({});
    mockPrisma.courseModule.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.$transaction.mockImplementation(async (ops: unknown[]) => {
      await Promise.all(ops as Promise<unknown>[]);
      return ops;
    });

    expect(await updateCourse("c1", { ...basePayload, workshopDate: "2026-11-22" }))
      .toEqual({ success: true });
    const update = mockPrisma.curso.update.mock.calls[0][0];
    const content = JSON.parse(update.data.content);
    expect(content.workshopDate).toBe("2026-11-22");
    expect(content.slug).toBe("workshop-tortas-basicas");
    expect(content.realizaremos).toEqual(["Torta de vainilla"]);
    expect(update.data.category).toBe("Workshops Presenciales");
  });

  it("rechaza una fecha imposible", async () => {
    expect(await createCourse({ ...basePayload, workshopDate: "2026-02-31" }))
      .toEqual({ error: "Selecciona una fecha válida para el workshop." });
    expect(mockPrisma.curso.create).not.toHaveBeenCalled();
  });
});
