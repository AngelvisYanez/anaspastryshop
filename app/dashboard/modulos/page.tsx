import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PlatformModuleManager from "./PlatformModuleManager";

export default async function ModulosPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const sections = await prisma.platformSection.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <PlatformModuleManager initialSections={sections} />
    </div>
  );
}
