import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentsView from "./StudentsView";

export default async function UsuariosPage() {
  const session = await auth();

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
    redirect("/dashboard");
  }

  const role = session.user.role;

  // Traemos los talleres del mentor (o todos si es ADMIN) con sus alumnos inscritos (aprobados)
  const talleres = await prisma.taller.findMany({
    where: role === "ADMIN" ? {} : { instructorId: session.user.id },
    select: {
      id: true,
      title: true,
      category: true,
      inscritos: {
        where: {
          status: "APPROVED",
        },
        select: {
          id: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1A1A2E]">Alumnos</h1>
        <p className="text-gray-400 font-medium">
          {role === "ADMIN" 
            ? "Gestión global de estudiantes y métricas totales." 
            : "Revisa los alumnos matriculados en tus talleres y cursos."}
        </p>
      </div>

      <StudentsView talleres={talleres} userRole={role as string} />
    </div>
  );
}
