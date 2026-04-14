import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllGatewayConfigs } from "@/lib/actions/gateway";
import GatewayManager from "./GatewayManager";

export default async function MetodosPagoPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const configs = await getAllGatewayConfigs();

  return (
    <div className="p-8">
      <GatewayManager configs={configs as any} />
    </div>
  );
}
