import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateLiveForm from "./CreateLiveForm";

export default async function CreateLivePage() {
  const session = await auth();

  if (!session?.user) redirect("/iniciar-sesion");
  const role = (session.user as any).role as string;
  if (role !== "ADMIN") redirect("/dashboard");

  return <CreateLiveForm />;
}
