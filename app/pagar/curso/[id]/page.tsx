import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import CheckoutCurso from "./CheckoutCurso";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { bagIdLookupOr } from "@/lib/utils/bagCourseLookup";

export const metadata = {
  title: "Inscripción & Pago",
  description: "Finaliza tu inscripción y compra tu acceso al curso online o taller presencial.",
};

async function CursoCheckoutContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let userId: string | undefined;
  let userName: string | undefined;
  let userEmail: string | undefined;
  try {
    const session = await auth();
    userId = session?.user?.id;
    userName = session?.user?.name ?? undefined;
    userEmail = session?.user?.email ?? undefined;
  } catch (err) {
    console.error("[pagar/curso] auth unavailable:", err);
  }

  const course = await prisma.curso.findFirst({
    where: { OR: bagIdLookupOr([id]) },
    include: {
      instructor: {
        select: { name: true, image: true },
      },
    },
  });

  if (!course) {
    notFound();
  }

  if (userId) {
    const existingApproved = await prisma.inscription.findFirst({
      where: {
        userId,
        cursoId: course.id,
        status: "APPROVED",
      },
    });

    if (existingApproved) {
      redirect(`/dashboard/cursos/${course.id}`);
    }
  }

  const workshopInfo = parseWorkshopDetails(course.content, course.isLive, course.title);

  return (
    <CheckoutCurso
      course={{
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        image: course.image,
        category: course.category,
        totalHours: course.totalHours,
        totalClasses: course.totalClasses,
        instructorName: course.instructor?.name ?? "Anais Flores",
      }}
      workshopInfo={workshopInfo}
      initialLoggedIn={Boolean(userId)}
      initialName={userName}
      initialEmail={userEmail}
    />
  );
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CursoCheckoutContent params={params} />
    </Suspense>
  );
}
