import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllGatewayConfigs } from "@/lib/actions/gateway";
import GatewayManager from "./GatewayManager";
import { DashboardPage } from "../DashboardPage";

export default async function MetodosPagoPage() {
  const session = await auth();

  if (!session?.user) redirect("/iniciar-sesion");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const configs = await getAllGatewayConfigs();

  return (
    <DashboardPage
      title="Métodos de Pago"
      description="Configura las pasarelas y datos de transferencia que ven tus clientes."
    >
      <GatewayManager configs={configs as any} />
    </DashboardPage>
  );
}
