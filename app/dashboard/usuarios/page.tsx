import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AllUsersView from "./AllUsersView";
import { DashboardPage } from "../DashboardPage";

export default async function UsuariosPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const allUsers = await prisma.user.findMany({
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
      _count: { select: { inscripciones: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardPage
      title="Usuarios"
      description="Directorio de todos los usuarios registrados en la plataforma."
    >
      <AllUsersView
        allUsers={allUsers as any}
        currentUserId={session.user.id as string}
      />
    </DashboardPage>
  );
}
