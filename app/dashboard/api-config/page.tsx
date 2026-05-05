import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllApiConfigs } from "@/lib/actions/platformApi";
import ApiConfigManager from "./ApiConfigManager";

export default async function ApiConfigPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/dashboard");

  const configs = await getAllApiConfigs();

  return (
    <div>
      <ApiConfigManager configs={configs as any} />
    </div>
  );
}
