import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateLiveForm from "./CreateLiveForm";

export default async function CreateLivePage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");
  const role = (session.user as any).role as string;
  if (!["ADMIN", "MENTOR"].includes(role)) redirect("/dashboard");

  return <CreateLiveForm />;
}
