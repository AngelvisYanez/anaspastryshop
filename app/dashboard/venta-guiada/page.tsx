import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { sellableFormations } from "@/lib/guided-sale";
import { prisma } from "@/lib/prisma";
import { parseWorkshopDetails } from "@/lib/utils/workshop";
import { DashboardPage } from "../DashboardPage";
import GuidedSaleForm from "./GuidedSaleForm";

export default async function GuidedSalePage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/dashboard");

  const formations = await prisma.curso.findMany({
    where: sellableFormations(),
    select: { id: true, title: true, price: true, content: true, isLive: true },
    orderBy: { title: "asc" },
  });

  return (
    <DashboardPage title="Venta guiada" wide={false}
      description="Registra un pago verificado y habilita la formación para el alumno.">
      {formations.length ? <GuidedSaleForm courses={formations.map(({ id, title, price, content, isLive }) => ({
        id, title, price, isWorkshop: parseWorkshopDetails(content, isLive, title).isWorkshop,
      }))} /> : (
        <p className="rounded-2xl border border-card-border bg-card p-6 text-sm text-muted">
          Publica una formación para poder registrar una venta.
        </p>
      )}
    </DashboardPage>
  );
}
