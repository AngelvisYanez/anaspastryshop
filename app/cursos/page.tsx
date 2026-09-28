import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { cacheTag, cacheLife } from "next/cache";
import PublicCoursesClient from "./PublicCoursesClient";
import type { Metadata } from "next";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { resolveCourseCover } from "@/lib/data/onlineCourseCovers";
import { ONLINE_COURSES_DATA, toOnlineFormacionCard } from "@/lib/data/online-courses";

export const metadata: Metadata = {
  title: "Cursos Online de Pastelería",
  description:
    "Cursos online de pastelería y repostería con módulos en video dictados por Anais Flores. Aprende a tu ritmo, desde cero y con demostraciones paso a paso.",
  openGraph: {
    title: "Cursos Online de Pastelería | Ana's Pastry Shop",
    description: "Cursos online de pastelería con la Chef Anais Flores.",
  },
};

async function getPublicCourses() {
  "use cache";
  cacheLife("hours");
  cacheTag("cursos");
  return prisma.curso.findMany({
    where: {
      OR: [
        { status: "PUBLISHED" },
        { status: "SCHEDULED", publishedAt: { lte: new Date() } },
      ],
    },
    include: {
      instructor: {
        select: {
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          courseModules: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function CursosContent() {
  const session = await auth();
  const userId = session?.user?.id;

  try {
    const [coursesDB, userInscriptions, userPurchases] = await Promise.all([
      getPublicCourses(),
      userId
        ? prisma.inscription.findMany({
            where: { userId, status: "APPROVED" },
            select: { cursoId: true },
          })
        : Promise.resolve([]),
      userId
        ? prisma.coursePurchase.findMany({
            where: { userId, status: "COMPLETED" },
            select: { cursoId: true },
          })
        : Promise.resolve([]),
    ]);

    const enrolledCourseIds = new Set<string>();
    userInscriptions.forEach((i) => {
      if (i.cursoId) enrolledCourseIds.add(i.cursoId);
    });
    userPurchases.forEach((p) => {
      if (p.cursoId) enrolledCourseIds.add(p.cursoId);
    });

    const courses = coursesDB
      .map((c) => {
        const workshopInfo = parseWorkshopDetails(c.content, c.isLive, c.title);
        return {
          id: c.id,
          slug: c.slug ?? undefined,
          title: c.title,
          description: c.description,
          price: c.price,
          image: resolveCourseCover({
            title: c.title,
            slug: c.slug ?? workshopInfo.slug,
            image: c.image,
            isWorkshop: workshopInfo.isWorkshop,
          }),
          category: c.category,
          level: c.level,
          totalHours: c.totalHours,
          totalClasses: c.totalClasses,
          modulesCount: c._count.courseModules,
          instructor: c.instructor,
          isWorkshop: workshopInfo.isWorkshop,
          workshopLocation: workshopInfo.location,
          workshopDate: workshopInfo.workshopDate,
          workshopTime: workshopInfo.workshopTime,
          hasAccess: enrolledCourseIds.has(c.id),
        };
      })
      .filter((c) => !c.isWorkshop);

    if (courses.length === 0) {
      return (
        <PublicCoursesClient
          initialCourses={ONLINE_COURSES_DATA.map((c) => toOnlineFormacionCard(c))}
        />
      );
    }

    return <PublicCoursesClient initialCourses={courses} />;
  } catch {
    return (
      <PublicCoursesClient
        initialCourses={ONLINE_COURSES_DATA.map((c) => toOnlineFormacionCard(c))}
      />
    );
  }
}

export default function CursosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CursosContent />
    </Suspense>
  );
}
