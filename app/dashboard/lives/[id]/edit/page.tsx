import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import EditLiveForm from "./EditLiveForm";

export default async function EditLivePage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");
  const role = (session.user as any).role as string;
  if (!["ADMIN", "MENTOR"].includes(role)) redirect("/dashboard");

  const live = await prisma.liveStream.findUnique({ where: { id: params.id } });
  if (!live) notFound();

  if (role === "MENTOR" && live.instructorId !== session.user.id) {
    redirect("/dashboard/lives");
  }

  return <EditLiveForm live={live} />;
}
