"use server";

import { refresh } from "next/cache";
import { checkUserCourseAccess } from "@/app/cursos/[slug]/checkUserCourseAccess";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseWorkshopDetails } from "@/lib/utils/workshop";

async function getStudentCourse(courseId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId || session.user.role === "ADMIN") return null;

  const course = await prisma.curso.findUnique({
    where: { id: courseId },
    select: { title: true, content: true, isLive: true },
  });
  if (!course || parseWorkshopDetails(course.content, course.isLive, course.title).isWorkshop) return null;
  if (!(await checkUserCourseAccess({ userId, courseId }))) return null;
  return userId;
}

export async function completeCourseModule(courseId: string, moduleId: string): Promise<string | null> {
  try {
    const userId = await getStudentCourse(courseId);
    if (!userId) return "No tienes acceso para registrar el avance de este curso.";

    const courseModule = await prisma.courseModule.findFirst({
      where: { id: moduleId, cursoId: courseId },
      select: { id: true },
    });
    if (!courseModule) return "Este módulo ya no está disponible.";

    await prisma.courseModuleCompletion.createMany({
      data: { userId, moduleId: courseModule.id },
      skipDuplicates: true,
    });
  } catch {
    return "No pudimos guardar tu avance. Inténtalo de nuevo.";
  }
  refresh();
  return null;
}

export async function submitCourseReview(courseId: string, _previous: string | null, formData: FormData): Promise<string | null> {
  const value = formData.get("comment");
  const comment = typeof value === "string" ? value.trim() : "";
  if (!comment || comment.length > 2000) return "Escribe una reseña de entre 1 y 2000 caracteres.";

  try {
    const userId = await getStudentCourse(courseId);
    if (!userId) return "No tienes acceso para reseñar este curso.";

    const course = await prisma.curso.findFirst({
      where: {
        id: courseId,
        courseModules: {
          some: {},
          every: { completions: { some: { userId } } },
        },
      },
      select: { id: true },
    });
    if (!course) return "Completa todos los módulos para enviar tu reseña.";

    await prisma.courseReview.createMany({
      data: { cursoId: course.id, userId, comment },
      skipDuplicates: true,
    });
  } catch {
    return "No pudimos enviar tu reseña. Inténtalo de nuevo.";
  }
  refresh();
  return null;
}
