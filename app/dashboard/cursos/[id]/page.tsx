import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import DashboardCourseViewer from "./DashboardCourseViewer";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { getCompactCourseImages } from "@/lib/data/compact-course-images";
import { courseImageUrl } from "@/lib/data/course-image-url";
import { checkUserCourseAccess } from "@/app/cursos/[slug]/checkUserCourseAccess";
import { getCourseReviewProgress } from "@/lib/data/course-reviews";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await prisma.curso.findUnique({
    where: { id },
    select: { title: true },
  });
  return {
    title: course ? `${course.title} | Dashboard` : "Curso no encontrado",
  };
}

export default async function DashboardCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [session, course] = await Promise.all([
    auth(),
    prisma.curso.findUnique({
      where: { id },
      omit: { image: true },
      include: {
        instructor: {
          select: {
            name: true,
            email: true,
          },
        },
        courseModules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
        _count: {
          select: {
            inscritos: true,
          },
        },
      },
    }),
  ]);

  if (!session?.user?.id) {
    redirect("/iniciar-sesion");
  }

  if (!course) {
    notFound();
  }

  const canManage = session.user.role === "ADMIN";
  const workshopInfo = parseWorkshopDetails(course.content, course.isLive, course.title);
  const [hasAccess, images] = await Promise.all([
    checkUserCourseAccess({ userId: session.user.id, role: session.user.role, courseId: id }),
    getCompactCourseImages([id]),
  ]);
  const reviewProgress = hasAccess && !canManage && !workshopInfo.isWorkshop && course.courseModules.length > 0
    ? await getCourseReviewProgress(id, session.user.id)
    : undefined;
  const image = images.get(id);
  const imageUrl = image?.startsWith("data:image/") && course.status !== "PUBLISHED"
    ? `/api/dashboard/course-image/${id}?v=${course.updatedAt.getTime()}`
    : courseImageUrl(id, image, course.updatedAt);

  return (
    <DashboardCourseViewer
      course={{ ...course, image: imageUrl ?? "" } as any}
      workshopInfo={workshopInfo}
      canManage={canManage}
      hasAccess={hasAccess}
      reviewProgress={reviewProgress}
    />
  );
}
