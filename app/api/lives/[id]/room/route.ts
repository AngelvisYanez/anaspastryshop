import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRtkConfig } from "@/lib/actions/platformApi";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const live = await prisma.liveStream.findUnique({ where: { id } });
  if (!live) {
    return NextResponse.json({ error: "Live no encontrado" }, { status: 404 });
  }

  const { accountId, appId, apiToken } = await getRtkConfig();
  const BASE = `https://api.cloudflare.com/client/v4/accounts/${accountId}/realtime/kit/${appId}`;
  const HEADERS = { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" };

  let meetingId = live.rtkMeetingId;

  if (!meetingId) {
    const res = await fetch(`${BASE}/meetings`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ title: live.title }),
    });
    const json = await res.json();
    meetingId = json.data?.id;
    if (!meetingId) {
      return NextResponse.json({ error: "Error al crear meeting en Cloudflare" }, { status: 500 });
    }
    await prisma.liveStream.update({ where: { id }, data: { rtkMeetingId: meetingId } });
  }

  const role = (session.user as any).role as string;
  const presetName = role === "ADMIN" ? "group_call_host" : "group_call_participant";

  const participantRes = await fetch(`${BASE}/meetings/${meetingId}/participants`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      name: session.user.name ?? "Participante",
      preset_name: presetName,
      custom_participant_id: session.user.id,
    }),
  });

  const participantJson = await participantRes.json();
  const token = participantJson.data?.token;

  if (!token) {
    return NextResponse.json({ error: "Error al obtener token de participante" }, { status: 500 });
  }

  return NextResponse.json({ token });
}
