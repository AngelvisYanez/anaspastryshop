import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_PDF_SIZE = 25 * 1024 * 1024;
const CHUNK_SIZE = 3 * 1024 * 1024;

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
  const file = form.get("recipe");
  if (!(file instanceof File) || file.type !== "application/pdf") {
    return Response.json({ error: "Selecciona un PDF válido." }, { status: 400 });
  }
  if (file.size === 0 || file.size > CHUNK_SIZE) {
    return Response.json({ error: "El fragmento debe pesar hasta 3 MB." }, { status: 413 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const uploadId = form.get("uploadId");
  if (typeof uploadId === "string" && uploadId) {
    const existing = await prisma.courseRecipePdf.findUnique({ where: { id: uploadId } });
    if (!existing || existing.data.length + bytes.length > MAX_PDF_SIZE) {
      return Response.json({ error: "No se pudo continuar la subida del PDF." }, { status: 400 });
    }
    const combined = new Uint8Array(existing.data.length + bytes.length);
    combined.set(existing.data);
    combined.set(bytes, existing.data.length);
    const upload = await prisma.courseRecipePdf.update({ where: { id: uploadId }, data: { data: combined }, select: { id: true } });
    return Response.json({ id: upload.id });
  }

  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
    return Response.json({ error: "El archivo no es un PDF válido." }, { status: 400 });
  }
  const upload = await prisma.courseRecipePdf.create({ data: { data: bytes }, select: { id: true } });
  return Response.json({ id: upload.id });
}
