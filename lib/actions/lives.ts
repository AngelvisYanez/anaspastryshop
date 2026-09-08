"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getRtkConfig } from "@/lib/actions/platformApi";

type LiveData = {
  title: string;
  description?: string;
  streamKey?: string;
  rtmpsUrl?: string;
  playbackId?: string;
  scheduledAt?: string;
};

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("No autorizado");
  return session;
}

export async function createLive(data: LiveData) {
  const session = await requireAdmin();
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

export async function updateLive(
  id: string,
  data: Partial<LiveData & { status: string }>,
) {
  await requireAdmin();
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

export async function updateLiveStatus(
  id: string,
  status: "SCHEDULED" | "LIVE" | "ENDED",
) {
  await requireAdmin();
  await prisma.liveStream.update({ where: { id }, data: { status } });
  revalidatePath("/dashboard/lives");
  return { success: true };
}

export async function deleteLive(id: string) {
  await requireAdmin();
  await prisma.liveStream.delete({ where: { id } });
  revalidatePath("/dashboard/lives");
  return { success: true };
}

export async function joinLiveRoom(
  liveId: string,
): Promise<{ token: string } | { error: string }> {
  const session = await auth();
  if (!session?.user) return { error: "No autorizado" };

  const live = await prisma.liveStream.findUnique({ where: { id: liveId } });
  if (!live) return { error: "Live no encontrado" };

  const { accountId, appId, apiToken } = await getRtkConfig();
  const BASE = `https://api.cloudflare.com/client/v4/accounts/${accountId}/realtime/kit/${appId}`;
  const HEADERS = {
    Authorization: `Bearer ${apiToken}`,
    "Content-Type": "application/json",
  };

  let meetingId = live.rtkMeetingId;
  if (!meetingId) {
    const res = await fetch(`${BASE}/meetings`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ title: live.title }),
    });
    const json = await res.json();
    meetingId = json.data?.id;
    if (!meetingId) return { error: "Error al crear meeting en Cloudflare" };
    await prisma.liveStream.update({
      where: { id: liveId },
      data: { rtkMeetingId: meetingId },
    });
  }

  const participantRes = await fetch(
    `${BASE}/meetings/${meetingId}/participants`,
    {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        name: session.user.name ?? "Participante",
        preset_name: "group_call_participant",
        custom_participant_id: session.user.id,
      }),
    },
  );

  const participantJson = await participantRes.json();
  const token = participantJson.data?.token;
  if (!token) return { error: "Error al obtener token de participante" };

  return { token };
}
