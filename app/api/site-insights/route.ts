import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { insightPath, INSIGHTS_BATCH_SIZE, isInsightEvent } from "@/lib/site-insights";

const MAX_BODY_BYTES = 4096;

export async function POST(request: Request) {
  if (request.headers.get("sec-fetch-site") !== "same-origin" ||
      request.headers.get("content-type") !== "application/json") {
    return new Response(null, { status: 403 });
  }
  const limit = rateLimit(clientKey("site-insights", request), { limit: 180, windowMs: 60_000 });
  if (!limit.allowed) return new Response(null, { status: 429 });

  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400 });

  let payload: unknown;
  try {
    const decoder = new TextDecoder();
    let size = 0;
    let body = "";
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return new Response(null, { status: 413 });
      }
      body += decoder.decode(value, { stream: true });
    }
    payload = JSON.parse(body + decoder.decode());
  } catch {
    return new Response(null, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null ||
      !("path" in payload) || typeof payload.path !== "string" ||
      !("mobile" in payload) || typeof payload.mobile !== "boolean" ||
      !("events" in payload) || !Array.isArray(payload.events) ||
      payload.events.length === 0 || payload.events.length > INSIGHTS_BATCH_SIZE ||
      !payload.events.every(isInsightEvent)) {
    return new Response(null, { status: 400 });
  }

  const path = insightPath(payload.path);
  if (!path) return new Response(null, { status: 400 });
  const eventStore = prisma.siteInsightEvent;
  if (!eventStore) return new Response(null, { status: 503 });

  const { mobile, events } = payload;
  try {
    await eventStore.createMany({
      data: events.map((event) => ({
        path,
        mobile,
        kind: event.kind,
        section: event.kind === "PAGE_VIEW" ? null : event.section,
        cell: event.kind === "CLICK" ? event.cell : null,
      })),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return new Response(null, { status: 503 });
    }
    throw error;
  }
  return new Response(null, { status: 204 });
}
