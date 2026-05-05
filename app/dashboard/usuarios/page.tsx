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
          _count: { select: { inscripciones: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const plans = role === "ADMIN"
    ? await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, price: true },
        orderBy: { price: "asc" },
      })
    : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">Usuarios</h1>
        <p className="text-muted font-medium">
          {role === "ADMIN"
            ? "Directorio completo de todos los usuarios registrados en la plataforma."
            : "Revisa los alumnos matriculados en tus cursos."}
        </p>
      </div>

      {role === "ADMIN" && (
        <AllUsersView
          allUsers={allUsers as any}
          plans={plans}
          currentUserId={session.user.id as string}
        />
      )}

      {role === "MENTOR" && (
        <StudentsView userRole={role} />
      )}
    </div>
  );
}
