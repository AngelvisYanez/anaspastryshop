import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateWorkshopForm from "../../create/CreateWorkshopForm";

export default async function EditWorkshopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
    redirect("/dashboard");
  }

  const taller = await prisma.taller.findUnique({
    where: { id },
    include: { 
      _count: { select: { inscritos: true } },
      modules: {
        include: { topics: true },
        orderBy: { order: "asc" }
      }
    }
  });

  if (!taller) redirect("/dashboard/talleres");

  // Seguridad: ADMIN o dueño del taller
  if (session.user.role !== "ADMIN" && taller.instructorId !== session.user.id) {
    redirect("/dashboard/talleres");
  }

  // Regla de Negocio: Bloqueo de edición
  if (session.user.role !== "ADMIN" && taller._count.inscritos >= 5) {
    // Si intenta acceder a URL directa y está bloqueado, lo regresamos
    redirect("/dashboard/talleres");
  }

  let mentors: { id: string; name: string | null; email: string | null }[] = [];
  if (session.user.role === "ADMIN") {
    mentors = await prisma.user.findMany({
      where: { role: "MENTOR" },
      select: { id: true, name: true, email: true },
    });
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <CreateWorkshopForm 
      userRole={session.user.role as string} 
      mentors={mentors} 
      categories={categories}
      initialData={taller}
      isEditing={true}
    />
  );
}
