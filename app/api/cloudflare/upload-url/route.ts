import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStreamConfig } from "@/lib/actions/platformApi";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { accountId, apiToken } = await getStreamConfig();

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxDurationSeconds: 21600,
        requireSignedURLs: false,
      }),
    }
  );

  if (!response.ok) {
    console.error("[upload-url] Cloudflare HTTP error:", response.status);
    return NextResponse.json(
      { error: "Error al obtener URL de subida de Cloudflare" },
      { status: 500 }
    );
  }

  const data = await response.json();

  if (!data.success) {
    console.error("[upload-url] Cloudflare error:", JSON.stringify(data.errors));
    return NextResponse.json(
      { error: "Error al obtener URL de subida de Cloudflare", details: data.errors },
      { status: 500 }
    );
  }

  return NextResponse.json({
    uploadUrl: data.result.uploadURL,
    uid: data.result.uid,
  });
}
