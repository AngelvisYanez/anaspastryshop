import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import CourseDetailClient from "./CourseDetailClient";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();

  const course = await prisma.curso.findUnique({
    where: { id },
    include: {
      instructor: true,
      courseModules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" }
          }
        }
      }
    }
  });

  if (!course) {
    notFound();
  }

  let hasPaid = false;

  if (session?.user) {
    if (session.user.role === "ADMIN" || course.instructorId === session.user.id) {
      hasPaid = true;
    } else {
      const inscription = await prisma.inscription.findFirst({
        where: {
          userId: session.user.id,
          cursoId: course.id,
          status: "APPROVED"
        }
      });
      if (inscription) {
        hasPaid = true;
      }
    }

    if (!hasPaid) {
      const activeSubscription = await prisma.subscription.findUnique({
        where: { userId: session.user.id },
      });
      if (activeSubscription?.status === "ACTIVE") {
        hasPaid = true;
      }
    }
  }

  return <CourseDetailClient course={course} hasPaid={hasPaid} />;
}
