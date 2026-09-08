import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import DashboardCourseViewer from "./DashboardCourseViewer";
import { parseWorkshopDetails } from "@/lib/utils/workshop";

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
  const session = await auth();

  if (!session?.user) {
    redirect("/iniciar-sesion");
  }

  const course = await prisma.curso.findUnique({
    where: { id },
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
  });

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

  return (
    <DashboardCourseViewer
      course={course as any}
      workshopInfo={workshopInfo}
      canManage={canManage}
      hasAccess={hasAccess}
    />
  );
}
