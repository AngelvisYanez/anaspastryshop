import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import EditLiveForm from "./EditLiveForm";

async function EditContent({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  const role = (session.user as any).role as string;
  if (!["ADMIN", "MENTOR"].includes(role)) redirect("/dashboard");

  const live = await prisma.liveStream.findUnique({ where: { id } });
  if (!live) notFound();

  if (role === "MENTOR" && live.instructorId !== session.user.id) {
    redirect("/dashboard/lives");
  }

  return <EditLiveForm live={live} />;
}

export default async function EditLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-muted">Cargando...</div>}>
      <EditContent id={id} />
    </Suspense>
  );
}
