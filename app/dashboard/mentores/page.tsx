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
      _count: { select: { talleres: true, cursos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-[#1A1A2E]">Mentores</h1>
        <p className="text-gray-400 font-medium">
          Gestiona, valida y administra los mentores de la plataforma.
        </p>
      </div>
      <MentoresView mentores={mentores} />
    </div>
  );
}
