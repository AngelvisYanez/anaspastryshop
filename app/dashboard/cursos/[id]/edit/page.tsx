import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseEditClient from "./CourseEditClient";

async function EditContent({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const course = await prisma.curso.findUnique({
    where: { id },
    include: {
      courseModules: {
        include: { lessons: true },
        orderBy: { order: "asc" }
      },
      _count: {
        select: { inscritos: true }
      }
    }
  });

  if (!course) redirect("/dashboard/cursos");

  return (
    <div className="max-w-5xl mx-auto">
      <CourseEditClient key={course.id} course={course} hasEnrolledStudents={course._count.inscritos > 0} />
    </div>
  );
}

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-muted">Cargando...</div>}>
      <EditContent id={id} />
    </Suspense>
  );
}
