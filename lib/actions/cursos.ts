"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types";
import { serializeWorkshopDetails } from "@/lib/utils/workshop";

async function assertAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("No autorizado. Solo administradores.");
  }
  return session;
}

export type CoursePayload = {
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
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishedAt?: string | null;
  location?: string;
  workshopDate?: string;
  workshopTime?: string;
  content?: string;
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
  const session = await assertAdmin();

  try {
    const totalClasses = data.modules.reduce((acc, m) => acc + m.lessons.length, 0);

    let finalInstructorId = session.user.id as string;
    if (data.instructorId && data.instructorId !== session.user.id) {
      finalInstructorId = data.instructorId;
    }

    const workshopContent = serializeWorkshopDetails({
      isWorkshop: data.isLive,
      location: data.location,
      workshopDate: data.workshopDate,
      workshopTime: data.workshopTime,
    });

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
        content: workshopContent,
        status: data.status,
        publishedAt: data.status === "SCHEDULED" && data.publishedAt ? new Date(data.publishedAt) : data.status === "PUBLISHED" ? new Date() : null,
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
  const session = await assertAdmin();

  try {
    const course = await prisma.curso.findUnique({
      where: { id: courseId },
      include: { _count: { select: { inscritos: true } } },
    });

    if (!course) return { error: "Curso no encontrado" };

    await prisma.curso.delete({ where: { id: courseId } });
    revalidatePath("/dashboard/cursos");
    revalidatePath("/cursos");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el curso" };
  }
}

export async function updateCourse(courseId: string, data: CoursePayload): Promise<ActionResult> {
  const session = await assertAdmin();

  try {
    const course = await prisma.curso.findUnique({
      where: { id: courseId },
      include: { _count: { select: { inscritos: true } } },
    });

    if (!course) return { error: "Curso no encontrado" };

    const hasEnrolled = course._count.inscritos > 0;
    const finalPrice = hasEnrolled ? course.price : data.price;
    const totalClasses = data.modules.reduce((acc, m) => acc + m.lessons.length, 0);

    const workshopContent = serializeWorkshopDetails({
      isWorkshop: data.isLive,
      location: data.location,
      workshopDate: data.workshopDate,
      workshopTime: data.workshopTime,
    });

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
      content: workshopContent,
      status: data.status,
      publishedAt: data.status === "SCHEDULED" && data.publishedAt ? new Date(data.publishedAt) : data.status === "PUBLISHED" ? new Date() : null,
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

    if (data.instructorId && data.instructorId !== session.user.id) {
      updateData.instructorId = data.instructorId;
    }

    await prisma.$transaction([
      prisma.courseModule.deleteMany({ where: { cursoId: courseId } }),
      prisma.curso.update({ where: { id: courseId }, data: updateData }),
    ]);

    revalidatePath("/dashboard/cursos");
    revalidatePath(`/dashboard/cursos/${courseId}`);
    revalidatePath("/cursos");
    revalidatePath(`/cursos/${courseId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error("Error updating course:", error);
    return { error: error instanceof Error ? error.message : "Error interno al actualizar el curso." };
  }
}
