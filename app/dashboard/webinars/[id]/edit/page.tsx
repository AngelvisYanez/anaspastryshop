import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditWebinarForm from "./EditWebinarForm";

export default async function EditWebinarPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const webinar = await prisma.webinar.findUnique({ where: { id } });
  if (!webinar) redirect("/dashboard/webinars");

  return (
    <div className="p-8">
      <EditWebinarForm webinar={webinar} />
    </div>
  );
}
