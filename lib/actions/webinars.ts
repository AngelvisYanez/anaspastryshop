"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type WebinarData = {
  title: string;
  description?: string;
  thumbnail?: string;
  scheduledAt?: string;
  maxParticipants?: number;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") throw new Error("No autorizado");
  return session;
}

export async function getWebinars() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return [];
  return prisma.webinar.findMany({
    include: { instructor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublicWebinars() {
  return prisma.webinar.findMany({
    where: { status: { in: ["LIVE", "SCHEDULED"] } },
    include: { instructor: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { scheduledAt: "asc" }],
  });
}

export async function createWebinar(data: WebinarData) {
  const session = await requireAdmin();
  try {
    const webinar = await prisma.webinar.create({
      data: {
        title: data.title,
        description: data.description || null,
        thumbnail: data.thumbnail || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        maxParticipants: data.maxParticipants || null,
        instructorId: session.user.id as string,
      },
    });
    revalidatePath("/dashboard/webinars");
    return { success: true, webinar };
  } catch {
    return { error: "Error al crear el webinar" };
  }
}

export async function updateWebinar(id: string, data: Partial<WebinarData & { status: string }>) {
  await requireAdmin();
  try {
    await prisma.webinar.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        maxParticipants: data.maxParticipants || null,
      },
    });
    revalidatePath("/dashboard/webinars");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el webinar" };
  }
}

export async function updateWebinarStatus(id: string, status: "SCHEDULED" | "LIVE" | "ENDED") {
  await requireAdmin();
  await prisma.webinar.update({ where: { id }, data: { status } });
  if (status === "ENDED") {
    await prisma.webinarSession.deleteMany({ where: { webinarId: id } });
  }
  revalidatePath("/dashboard/webinars");
  revalidatePath("/webinars");
  return { success: true };
}

export async function deleteWebinar(id: string) {
  await requireAdmin();
  await prisma.webinar.delete({ where: { id } });
  revalidatePath("/dashboard/webinars");
  return { success: true };
}
