import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import EditWebinarForm from "./EditWebinarForm";

async function EditContent({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");

  const webinar = await prisma.webinar.findUnique({ where: { id } });
  if (!webinar) redirect("/dashboard/webinars");

  return (
    <div>
      <EditWebinarForm webinar={webinar} />
    </div>
  );
}

export default async function EditWebinarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-muted">Cargando...</div>}>
      <EditContent id={id} />
    </Suspense>
  );
}
