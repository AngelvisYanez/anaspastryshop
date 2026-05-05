import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseEditClient from "./CourseEditClient";

async function EditContent({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
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

  const isAdmin = session.user.role === "ADMIN";
  let mentors: Array<{ id: string, name: string | null, email: string }> = [];

  if (isAdmin) {
    mentors = await prisma.user.findMany({
      where: { role: "MENTOR", isApproved: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" }
    });
  }

  if (!course) redirect("/dashboard/cursos");

  if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
    redirect("/dashboard/cursos");
  }

  return (
    <div className="max-w-5xl mx-auto">
      <CourseEditClient course={course} hasEnrolledStudents={course._count.inscritos > 0} mentors={mentors} isAdmin={isAdmin} />
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
