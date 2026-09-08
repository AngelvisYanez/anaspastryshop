import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import CheckoutCurso from "./CheckoutCurso";
import { parseWorkshopDetails } from "@/lib/utils/workshop";

export const metadata = {
  title: "Inscripción & Pago | Ana's Pastry Shop",
  description: "Finaliza tu inscripción y compra tu acceso al curso online o taller presencial.",
};

async function CursoCheckoutContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const course = await prisma.curso.findFirst({
    where: {
      OR: [
        { id },
        { content: { contains: id } },
        { title: { contains: id } },
      ],
    },
    include: {
      instructor: {
        select: { name: true, image: true },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Verificar si ya está inscrito y aprobado
  if (session?.user?.id) {
    const existingApproved = await prisma.inscription.findFirst({
      where: {
        userId: session.user.id,
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
      initialLoggedIn={Boolean(session?.user)}
      initialName={session?.user?.name ?? undefined}
      initialEmail={session?.user?.email ?? undefined}
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
