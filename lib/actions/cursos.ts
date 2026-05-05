"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";

async function assertMentorOrAdmin() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
    throw new Error("No autorizado. Solo administradores o mentores.");
  }
  return session;
}

type CoursePayload = {
  title: string;
  description: string;
  price: number;
  totalHours: number;
  totalClasses: number;
  language: string;
  level: string;
  image?: string;
  introVideo?: string;
  isLive: boolean;
  liveUrl?: string;
  modules: {
    title: string;
    videoUrl?: string;
    lessons: {
      title: string;
      summary?: string;
    }[];
  }[];
  instructorId?: string;
};

export async function createCourse(data: CoursePayload): Promise<ActionResult<{ courseId: string }>> {
  const session = await assertMentorOrAdmin();

  try {
    const totalClasses = data.modules.reduce((acc, m) => acc + m.lessons.length, 0);

    let finalInstructorId = session.user.id as string;
    if (session.user.role === "ADMIN") {
      if (!data.instructorId) {
        return { error: "Como administrador, debes asignar un mentor responsable al curso." };
      }
      finalInstructorId = data.instructorId;
    }

    const curso = await prisma.curso.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        totalHours: data.totalHours,
        totalClasses,
        language: data.language,
        level: data.level,
        image: data.image,
        introVideo: data.introVideo,
        isLive: data.isLive,
        liveUrl: data.liveUrl,
        instructorId: finalInstructorId,
        courseModules: {
          create: data.modules.map((m, mIndex) => ({
            title: m.title,
            videoUrl: m.videoUrl,
            order: mIndex,
            lessons: {
              create: m.lessons.map((l, lIndex) => ({
                title: l.title,
                summary: l.summary,
                order: lIndex,
              })),
            },
          })),
        },
      },
    });

    revalidatePath("/dashboard/cursos");
    revalidatePath("/cursos");
    return { success: true, courseId: curso.id };
  } catch (error: unknown) {
    console.error("Error creating course:", error);
    return { error: error instanceof Error ? error.message : "Error interno al crear el curso." };
  }
}

export async function deleteCourse(courseId: string): Promise<ActionResult> {
  const session = await assertMentorOrAdmin();

  try {
    const course = await prisma.curso.findUnique({
      where: { id: courseId },
      include: { _count: { select: { inscritos: true } } },
    });

    if (!course) return { error: "Curso no encontrado" };

    if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
      return { error: "No autorizado." };
    }

    if (course._count.inscritos > 0) {
      return { error: "No se puede eliminar un curso con alumnos inscritos." };
    }

    await prisma.curso.delete({ where: { id: courseId } });
    revalidatePath("/dashboard/cursos");
    revalidatePath("/cursos");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el curso" };
  }
}

export async function updateCourse(courseId: string, data: CoursePayload): Promise<ActionResult> {
  const session = await assertMentorOrAdmin();

  try {
    const course = await prisma.curso.findUnique({
      where: { id: courseId },
      include: { _count: { select: { inscritos: true } } },
    });

    if (!course) return { error: "Curso no encontrado" };

    if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
      return { error: "No autorizado para editar este curso." };
    }

    const hasEnrolled = course._count.inscritos > 0;
    const finalPrice = hasEnrolled ? course.price : data.price;
    const totalClasses = data.modules.reduce((acc, m) => acc + m.lessons.length, 0);

    const updateData: Parameters<typeof prisma.curso.update>[0]["data"] & { instructorId?: string } = {
      title: data.title,
      description: data.description,
      price: finalPrice,
      totalHours: data.totalHours,
      totalClasses,
      language: data.language,
      level: data.level,
      image: data.image,
      introVideo: data.introVideo,
      isLive: data.isLive,
      liveUrl: data.liveUrl,
      courseModules: {
        create: data.modules.map((m, mIndex) => ({
          title: m.title,
          videoUrl: m.videoUrl,
          order: mIndex,
          lessons: {
            create: m.lessons.map((l, lIndex) => ({
              title: l.title,
              summary: l.summary,
              order: lIndex,
            })),
          },
        })),
      },
    };

    if (session.user.role === "ADMIN" && data.instructorId) {
      updateData.instructorId = data.instructorId;
    }

    await prisma.$transaction([
      prisma.courseModule.deleteMany({ where: { cursoId: courseId } }),
      prisma.curso.update({ where: { id: courseId }, data: updateData }),
    ]);

    revalidatePath("/dashboard/cursos");
    revalidatePath("/cursos");
    revalidatePath(`/cursos/${courseId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating course:", error);
    return { error: error instanceof Error ? error.message : "Error interno al actualizar el curso." };
  }
}
