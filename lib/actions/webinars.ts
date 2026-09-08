"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getRtkConfig } from "@/lib/actions/platformApi";

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

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

export async function joinWebinarRoom(webinarId: string): Promise<{ token: string } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const userId = session.user.id as string;
  const webinar = await prisma.webinar.findUnique({ where: { id: webinarId } });
  if (!webinar) return { error: "Webinar no encontrado" };

  const existingSession = await prisma.webinarSession.findUnique({
    where: { webinarId_userId: { webinarId, userId } },
  });
  if (existingSession && Date.now() - existingSession.createdAt.getTime() < SESSION_MAX_AGE_MS) {
    return { error: "Ya tienes una sesión activa en este webinar. Cierra la otra pestaña o dispositivo." };
  }

  if (webinar.maxParticipants) {
    const activeCount = await prisma.webinarSession.count({ where: { webinarId } });
    if (activeCount >= webinar.maxParticipants) {
      return { error: `La sala está llena. El límite de ${webinar.maxParticipants} participantes ha sido alcanzado.` };
    }
  }

  const { accountId, appId, apiToken } = await getRtkConfig();
  const BASE = `https://api.cloudflare.com/client/v4/accounts/${accountId}/realtime/kit/${appId}`;
  const HEADERS = { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" };

  let meetingId = webinar.rtkMeetingId;
  if (!meetingId) {
    const res = await fetch(`${BASE}/meetings`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ title: webinar.title }),
    });
    const json = await res.json();
    meetingId = json.data?.id;
    if (!meetingId) return { error: "Error al crear meeting en Cloudflare" };
    await prisma.webinar.update({ where: { id: webinarId }, data: { rtkMeetingId: meetingId } });
  }

  const participantRes = await fetch(`${BASE}/meetings/${meetingId}/participants`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      name: session.user.name ?? "Participante",
      preset_name: "group_call_participant",
      custom_participant_id: userId,
    }),
  });

  const participantJson = await participantRes.json();
  const token = participantJson.data?.token;
  if (!token) return { error: "Error al obtener token de participante" };

  await prisma.webinarSession.upsert({
    where: { webinarId_userId: { webinarId, userId } },
    create: { webinarId, userId },
    update: { createdAt: new Date() },
  });

  return { token };
}

export async function leaveWebinarRoom(webinarId: string) {
  const session = await auth();
  if (!session?.user) return;
  const userId = session.user.id as string;
  await prisma.webinarSession.deleteMany({ where: { webinarId, userId } });
}
