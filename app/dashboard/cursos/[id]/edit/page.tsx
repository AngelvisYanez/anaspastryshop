import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseEditClient from "./CourseEditClient";

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  const course = await prisma.curso.findUnique({
    where: { id: id },
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

  let mentors: Array<{ id: string, name: string | null, email: string }> = [];
  const isAdmin = session.user.role === "ADMIN";
  
  if (isAdmin) {
    mentors = await prisma.user.findMany({
      where: { role: "MENTOR", isApproved: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" }
    });
  }

  if (!course) {
    redirect("/dashboard/cursos");
  }

  // Security Auth
  if (session.user.role !== "ADMIN" && course.instructorId !== session.user.id) {
    redirect("/dashboard/cursos");
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <CourseEditClient course={course} hasEnrolledStudents={course._count.inscritos > 0} mentors={mentors} isAdmin={isAdmin} />
    </div>
  );
}
