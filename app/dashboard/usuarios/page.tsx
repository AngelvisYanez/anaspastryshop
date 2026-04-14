import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentsView from "./StudentsView";
import AllUsersView from "./AllUsersView";

export default async function UsuariosPage() {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
    redirect("/dashboard");
  }

  const role = session.user.role;

  const allUsers = role === "ADMIN"
    ? await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          isApproved: true,
          isActive: true,
          deactivationReason: true,
          createdAt: true,
          subscription: { select: { plan: true, status: true } },
          _count: { select: { talleres: true, inscripciones: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const talleres = await prisma.taller.findMany({
    where: role === "ADMIN" ? {} : { instructorId: session.user.id },
    select: {
      id: true,
      title: true,
      category: true,
      inscritos: {
        where: { status: "APPROVED" },
        select: {
          id: true,
          createdAt: true,
          user: { select: { name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const plans = role === "ADMIN"
    ? await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, price: true },
        orderBy: { price: "asc" },
      })
    : [];

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1A1A2E]">Usuarios</h1>
        <p className="text-gray-400 font-medium">
          {role === "ADMIN"
            ? "Directorio completo de todos los usuarios registrados en la plataforma."
            : "Revisa los alumnos matriculados en tus talleres y cursos."}
        </p>
      </div>

      {role === "ADMIN" && (
        <AllUsersView
          allUsers={allUsers as any}
          talleres={talleres}
          plans={plans}
          currentUserId={session.user.id as string}
        />
      )}

      {role === "MENTOR" && (
        <StudentsView talleres={talleres} userRole={role} />
      )}
    </div>
  );
}
