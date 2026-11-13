import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CourseEditClient from "./CourseEditClient";
import { getCompactCourseImages } from "@/lib/data/compact-course-images";
import { courseImageUrl } from "@/lib/data/course-image-url";

async function EditContent({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const course = await prisma.curso.findUnique({
    where: { id },
    select: {
      id: true, title: true, description: true, price: true, content: true,
      introVideo: true, isLive: true, liveUrl: true, language: true,
      level: true, status: true, publishedAt: true, updatedAt: true,
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

  const image = (await getCompactCourseImages([id])).get(id);
  const imageUrl = image?.startsWith("data:image/") && course.status !== "PUBLISHED"
    ? `/api/dashboard/course-image/${id}?v=${course.updatedAt.getTime()}`
    : courseImageUrl(id, image, course.updatedAt);

  return (
    <div className="max-w-5xl mx-auto">
      <CourseEditClient key={course.id} course={{ ...course, image: imageUrl }} hasEnrolledStudents={course._count.inscritos > 0} />
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
