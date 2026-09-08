import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRtkConfig } from "@/lib/actions/platformApi";
import { NextResponse } from "next/server";

const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const userId = session.user.id as string;

  const webinar = await prisma.webinar.findUnique({ where: { id } });
  if (!webinar) {
    return NextResponse.json({ error: "Webinar no encontrado" }, { status: 404 });
  }

  const existingSession = await prisma.webinarSession.findUnique({
    where: { webinarId_userId: { webinarId: id, userId } },
  });

  if (existingSession && Date.now() - existingSession.createdAt.getTime() < SESSION_MAX_AGE_MS) {
    return NextResponse.json(
      { error: "Ya tienes una sesión activa en este webinar. Cierra la otra pestaña o dispositivo." },
      { status: 403 }
    );
  }

  if (webinar.maxParticipants) {
    const activeCount = await prisma.webinarSession.count({ where: { webinarId: id } });
    if (activeCount >= webinar.maxParticipants) {
      return NextResponse.json(
        { error: `La sala está llena. El límite de ${webinar.maxParticipants} participantes ha sido alcanzado.` },
        { status: 403 }
      );
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
    if (!meetingId) {
      return NextResponse.json({ error: "Error al crear meeting en Cloudflare" }, { status: 500 });
    }
    await prisma.webinar.update({ where: { id }, data: { rtkMeetingId: meetingId } });
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

  if (!token) {
    return NextResponse.json({ error: "Error al obtener token de participante" }, { status: 500 });
  }

  await prisma.webinarSession.upsert({
    where: { webinarId_userId: { webinarId: id, userId } },
    create: { webinarId: id, userId },
    update: { createdAt: new Date() },
  });

  return NextResponse.json({ token });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id as string;

  await prisma.webinarSession.deleteMany({ where: { webinarId: id, userId } });

  return NextResponse.json({ ok: true });
}
