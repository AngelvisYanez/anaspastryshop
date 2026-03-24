import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CreateWorkshopForm from "./CreateWorkshopForm";

export default async function CreateWorkshopPage() {
  const session = await auth();

  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MENTOR")) {
    redirect("/dashboard");
  }

  // Si es ADMIN, buscamos todos los mentores para que pueda asignar
  let mentors: { id: string; name: string | null; email: string | null }[] = [];
  
  if (session.user.role === "ADMIN") {
    mentors = await prisma.user.findMany({
      where: {
        role: "MENTOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }
  // @ts-ignore
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <CreateWorkshopForm 
      userRole={session.user.role as string} 
      mentors={mentors} 
      categories={categories}
    />
  );
}
