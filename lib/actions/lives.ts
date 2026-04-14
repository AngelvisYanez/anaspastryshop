"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type LiveData = {
  title: string;
  description?: string;
  streamKey?: string;
  rtmpsUrl?: string;
  playbackId?: string;
  scheduledAt?: string;
};

async function requireRole() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  const role = (session.user as any).role as string;
  if (!["ADMIN", "MENTOR"].includes(role)) throw new Error("No autorizado");
  return session;
}

export async function getLives() {
  const session = await auth();
  if (!session?.user) return [];
  const role = (session.user as any).role as string;
  const where = role === "ADMIN" ? {} : { instructorId: session.user.id as string };
  return prisma.liveStream.findMany({
    where,
    include: { instructor: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLive(data: LiveData) {
  const session = await requireRole();
  try {
    const live = await prisma.liveStream.create({
      data: {
        title: data.title,
        description: data.description || null,
        streamKey: data.streamKey || null,
        rtmpsUrl: data.rtmpsUrl || null,
        playbackId: data.playbackId || null,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        instructorId: session.user.id as string,
      },
    });
    revalidatePath("/dashboard/lives");
    return { success: true, live };
  } catch {
    return { error: "Error al crear el live" };
  }
}

export async function updateLive(id: string, data: Partial<LiveData & { status: string }>) {
  await requireRole();
  try {
    await prisma.liveStream.update({
      where: { id },
      data: {
        ...data,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      },
    });
    revalidatePath("/dashboard/lives");
    return { success: true };
  } catch {
    return { error: "Error al actualizar el live" };
  }
}

export async function updateLiveStatus(id: string, status: "SCHEDULED" | "LIVE" | "ENDED") {
  await requireRole();
  await prisma.liveStream.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/lives");
  return { success: true };
}

export async function deleteLive(id: string) {
  await requireRole();
  await prisma.liveStream.delete({ where: { id } });
  revalidatePath("/dashboard/lives");
  return { success: true };
}
