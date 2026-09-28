import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStreamConfig } from "@/lib/actions/platformApi";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "El archivo no puede superar 5MB" }, { status: 400 });
    }

    const { accountId, apiToken } = await getStreamConfig();

    if (!accountId || !apiToken) {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
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

    if (!response.ok) {
      console.error("[upload-image] Cloudflare Images HTTP error:", response.status);
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }

    const data = await response.json();

    if (!data.success) {
      console.error("[upload-image] Cloudflare Images error:", data.errors);
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;
      return NextResponse.json({ url: dataUrl });
    }

    return NextResponse.json({ url: data.result.variants[0] });
  } catch (err) {
    console.error("[upload-image] Error:", err);
    return NextResponse.json({ error: "Error interno al subir la imagen" }, { status: 500 });
  }
}
