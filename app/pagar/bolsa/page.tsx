import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CheckoutBolsa from "./CheckoutBolsa";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { bagIdLookupOr, courseMatchesBagId } from "@/lib/utils/bagCourseLookup";

export const metadata = {
  title: "Pago de tu Bolsa",
  description: "Finaliza el pago de todos los cursos online y workshops presenciales de tu bolsa.",
};

async function BolsaCheckoutContent({
  searchParams,
}: {
  searchParams: Promise<{ items?: string }>;
}) {
  const { items: itemsParam } = await searchParams;

  if (!itemsParam) {
    redirect("/cursos");
  }

  let userId: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id;
  } catch (err) {
    console.error("[pagar/bolsa] auth unavailable:", err);
  }

  const requestedIds = [
    ...new Set(
      itemsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];

  if (requestedIds.length === 0) {
    redirect("/cursos");
  }

  const lookup = bagIdLookupOr(requestedIds);
  const coursesDB = await prisma.curso.findMany({
    where: { OR: lookup },
    include: {
      instructor: {
        select: { name: true, image: true },
      },
    },
  });

  const orderedCourseRows = requestedIds.flatMap((id) =>
    coursesDB.filter((c) => courseMatchesBagId(c, id))
  );
  const courseRows = [...new Map(orderedCourseRows.map((c) => [c.id, c])).values()];
  const activeCourseIds = courseRows.map((c) => c.id);

  const userInscriptions =
    userId && activeCourseIds.length > 0
      ? await prisma.inscription.findMany({
          where: {
            userId,
            cursoId: { in: activeCourseIds },
            status: { in: ["PENDING", "APPROVED"] },
          },
          select: { cursoId: true, status: true },
        })
      : [];

  const inscribed = new Map<string, string>();
  userInscriptions.forEach((i) => {
    if (i.cursoId) inscribed.set(i.cursoId, i.status);
  });

  const courses = courseRows.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    image: course.image,
    category: course.category,
    totalHours: course.totalHours,
    totalClasses: course.totalClasses,
    isWorkshop: parseWorkshopDetails(course.content, course.isLive, course.title).isWorkshop,
    hasApproved: inscribed.get(course.id) === "APPROVED",
    alreadyPending: inscribed.get(course.id) === "PENDING",
  }));

  const notApproved = courses.filter((c) => !c.hasApproved);

  if (courses.length === 0) {
    redirect("/cursos");
  }

  if (notApproved.length === 0) {
    redirect("/mis-cursos");
  }

  return (
    <CheckoutBolsa
      courses={notApproved}
      skippedApproved={courses.length - notApproved.length}
      initialLoggedIn={Boolean(userId)}
    />
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ items?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BolsaCheckoutContent searchParams={searchParams} />
    </Suspense>
  );
}
