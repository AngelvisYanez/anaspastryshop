import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MentoresView from "./MentoresView";

export default async function MentoresPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const mentores = await prisma.user.findMany({
    where: { role: "MENTOR" },
    include: {
      _count: { select: { cursos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <p className="text-muted font-medium mb-8">Gestiona, valida y administra los mentores de la plataforma.</p>
      <MentoresView mentores={mentores} />
    </div>
  );
}
