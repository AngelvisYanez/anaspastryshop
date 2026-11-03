export function normalizeWhatsAppNumber(value: string): string | null {
  const number = value.replace(/[\s()+-]/g, "");
  return /^[1-9]\d{7,14}$/.test(number) ? number : null;
}

export function paymentSubmittedText(titles: string[]): string {
  const names = titles.map((title) => `• ${title}`).join("\n");
  return `Hola, recibimos tu comprobante de pago para:\n${names}\nTu pago está pendiente de revisión. Te avisaremos cuando sea aprobado. — Ana's Pastry Shop`;
}

export function paymentApprovedText(title: string): string {
  return `¡Tu pago de ${title} fue aprobado! Ya puedes acceder desde tu cuenta en https://anaspastryshop.com/dashboard/mis-cursos. — Ana's Pastry Shop`;
}

export function newsletterWhatsAppText(title: string, html: string): string {
  const summary = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ").trim().slice(0, 500);
  return `${title.trim()}\n\n${summary}\n\nhttps://anaspastryshop.com/cursos\n\nPara dejar de recibir novedades, desactiva WhatsApp en tu perfil.`;
}

export async function wakeWhatsAppBridge(): Promise<void> {
  const baseUrl = process.env.WA_BRIDGE_URL;
  const apiKey = process.env.WA_BRIDGE_API_KEY;
  if (!baseUrl || !apiKey) return;
  try {
    await fetch(`${baseUrl.replace(/\/+$/, "")}/dispatch`, {
      method: "POST",
      headers: { apikey: apiKey },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
  } catch (error) {
    console.warn("[whatsapp] El puente procesará los avisos pendientes al reconectar:",
      error instanceof Error ? error.message : "error de red");
  }
}
