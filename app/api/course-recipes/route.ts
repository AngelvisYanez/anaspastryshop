import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_PDF_SIZE = 25 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return Response.json({ error: "No autorizado." }, { status: 403 });
  }

  const length = Number(request.headers.get("content-length"));
  if (length > MAX_PDF_SIZE + 1024 * 1024) {
    return Response.json({ error: "El PDF no puede superar 25 MB." }, { status: 413 });
  }

  const form = await request.formData();
  const file = form.get("recipe");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_PDF_SIZE || file.type !== "application/pdf") {
    return Response.json({ error: "Selecciona un PDF de hasta 25 MB." }, { status: 400 });
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") {
    return Response.json({ error: "El archivo no es un PDF válido." }, { status: 400 });
  }
  const upload = await prisma.courseRecipePdf.create({ data: { data: bytes }, select: { id: true } });
  return Response.json({ id: upload.id });
}
