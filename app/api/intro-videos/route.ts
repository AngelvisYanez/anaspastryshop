import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_VIDEO_SIZE = 25 * 1024 * 1024;
const CHUNK_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["video/mp4", "video/webm", "video/ogg"]);

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "No autorizado." }, { status: 403 });
  }

  const length = Number(request.headers.get("content-length"));
  if (length > CHUNK_SIZE + 1024 * 1024) {
    return Response.json({ error: "El fragmento es demasiado grande." }, { status: 413 });
  }

  const form = await request.formData();
  const file = form.get("video");
  if (!(file instanceof File) || !ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: "Selecciona un video MP4, WebM u Ogg." }, { status: 400 });
  }
  if (file.size === 0 || file.size > CHUNK_SIZE) {
    return Response.json({ error: "El fragmento debe pesar hasta 3 MB." }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const uploadId = form.get("uploadId");
  const upload = typeof uploadId === "string" && uploadId
    ? await (async () => {
        const existing = await prisma.introVideoUpload.findUnique({ where: { id: uploadId } });
        if (!existing || existing.mimeType !== file.type || existing.data.length + bytes.length > MAX_VIDEO_SIZE) {
          return null;
        }
        const combined = new Uint8Array(existing.data.length + bytes.length);
        combined.set(existing.data);
        combined.set(bytes, existing.data.length);
        return prisma.introVideoUpload.update({ where: { id: uploadId }, data: { data: combined }, select: { id: true } });
      })()
    : await prisma.introVideoUpload.create({
        data: { data: bytes, mimeType: file.type },
        select: { id: true },
      });
  if (!upload) return Response.json({ error: "No se pudo continuar la subida." }, { status: 400 });
  return Response.json({ url: `/api/intro-videos/${upload.id}` });
}
