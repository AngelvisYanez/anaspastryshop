import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateWebinarForm from "./CreateWebinarForm";

export default async function CreateWebinarPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");
  return (
    <div className="p-8">
      <CreateWebinarForm />
    </div>
  );
}
