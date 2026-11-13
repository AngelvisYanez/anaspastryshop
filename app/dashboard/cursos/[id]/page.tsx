import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import DashboardCourseViewer from "./DashboardCourseViewer";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { getCompactCourseImages } from "@/lib/data/compact-course-images";
import { courseImageUrl } from "@/lib/data/course-image-url";

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

  if (!session?.user) {
    redirect("/iniciar-sesion");
  }

  if (!course) {
    notFound();
  }

  const role = session.user.role;
  const isAdmin = role === "ADMIN";
  const canManage = isAdmin;

  let hasAccess = canManage;

  if (!hasAccess) {
    // Check if user has approved inscription
    const inscription = await prisma.inscription.findFirst({
      where: {
        userId: session.user.id,
        cursoId: course.id,
        status: "APPROVED",
      },
    });

    if (inscription) {
      hasAccess = true;
    } else {
      // Check if user has completed CoursePurchase
      const purchase = await prisma.coursePurchase.findFirst({
        where: {
          userId: session.user.id,
          cursoId: course.id,
          status: "COMPLETED",
        },
      });
      if (purchase) {
        hasAccess = true;
      }
    }
  }

  const workshopInfo = parseWorkshopDetails(course.content, course.isLive, course.title);
  const image = (await getCompactCourseImages([id])).get(id);
  const imageUrl = image?.startsWith("data:image/") && course.status !== "PUBLISHED"
    ? `/api/dashboard/course-image/${id}?v=${course.updatedAt.getTime()}`
    : courseImageUrl(id, image, course.updatedAt);

  return (
    <DashboardCourseViewer
      course={{ ...course, image: imageUrl ?? "" } as any}
      workshopInfo={workshopInfo}
      canManage={canManage}
      hasAccess={hasAccess}
    />
  );
}
