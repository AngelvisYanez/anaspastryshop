import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStreamConfig } from "@/lib/actions/platformApi";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { accountId, apiToken } = await getStreamConfig();

  if (!accountId || !apiToken) {
    return NextResponse.json({ error: "Credenciales de Cloudflare no configuradas" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    const cfFormData = new FormData();
    cfFormData.append("file", file);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
        body: cfFormData,
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error("[upload-image] Cloudflare Images error:", data.errors);
      return NextResponse.json(
        { error: data.errors?.[0]?.message || "Error al subir la imagen" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: data.result.variants[0] });
  } catch (err) {
    console.error("[upload-image] Error:", err);
    return NextResponse.json({ error: "Error interno al subir la imagen" }, { status: 500 });
  }
}
