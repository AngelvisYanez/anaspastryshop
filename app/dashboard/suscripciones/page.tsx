import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SuscripcionesClient from "./SuscripcionesClient";

export default async function SuscripcionesPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const [suscripciones, plans, sections] = await Promise.all([
    prisma.subscription.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { startDate: "desc" },
    }),
    prisma.subscriptionPlan.findMany({ orderBy: { price: "asc" } }),
    prisma.platformSection.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div>
      <SuscripcionesClient
        suscripciones={suscripciones as any}
        initialPlans={plans as any}
        sections={sections}
      />
    </div>
  );
}
