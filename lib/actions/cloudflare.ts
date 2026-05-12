"use server";

import { getStreamConfig } from "@/lib/actions/platformApi";
import { auth } from "@/lib/auth";

export async function getDirectUploadUrl(maxDurationSeconds = 21600) {
  const session = await auth();
  if (!session?.user) {
    return { error: "No autorizado" };
  }

  const { accountId, apiToken } = await getStreamConfig();

  if (!accountId || !apiToken) {
    return { error: "Credenciales de Cloudflare no configuradas." };
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds,
          requireSignedURLs: false,
        }),
      }
    );

    const data = await response.json();

    if (!data.success) {
      console.error("[Cloudflare Stream] Error:", data.errors);
      return { error: data.errors[0]?.message || "Error al generar URL de subida." };
    }

    return {
      uploadURL: data.result.uploadURL,
      uid: data.result.uid,
    };
  } catch {
    return { error: "Error de conexión con Cloudflare." };
  }
}
