import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const upload = await prisma.introVideoUpload.findUnique({ where: { id } });
  if (!upload) return new Response(null, { status: 404 });

  const data = new Uint8Array(upload.data);
  const range = request.headers.get("range");
  const match = range?.match(/^bytes=(\d+)-(\d*)$/);
  const start = match ? Number(match[1]) : 0;
  const end = match && match[2] ? Number(match[2]) : data.length - 1;
  if (range && (!match || start >= data.length || end < start || end >= data.length)) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${data.length}` } });
  }

  const body = range ? data.slice(start, end + 1) : data;
  return new Response(body, {
    status: range ? 206 : 200,
    headers: {
      "Content-Type": upload.mimeType,
      "Content-Length": String(body.length),
      "Accept-Ranges": "bytes",
      ...(range ? { "Content-Range": `bytes ${start}-${end}/${data.length}` } : {}),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
