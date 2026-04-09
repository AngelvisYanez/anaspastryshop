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

  // Para ADMIN: traemos TODOS los usuarios registrados (mentores + alumnos comunes)
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
          _count: { select: { talleres: true, inscripciones: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  // Para talleres con inscritos (vista de mentores y alumnos por taller)
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

      {/* Admin ve el panel completo de todos los usuarios */}
      {role === "ADMIN" && (
        <AllUsersView
          allUsers={allUsers}
          talleres={talleres}
          currentUserId={session.user.id as string}
        />
      )}

      {/* Mentor solo ve sus alumnos por taller */}
      {role === "MENTOR" && (
        <StudentsView talleres={talleres} userRole={role} />
      )}
    </div>
  );
}
