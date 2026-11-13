import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return new Response(null, { status: 403 });

  const { id } = await params;
  const course = await prisma.curso.findUnique({
    where: { id },
    select: { image: true, updatedAt: true },
  });
  if (!course?.image) return new Response(null, { status: 404 });

  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([\s\S]+)$/i.exec(course.image);
  if (!match) return new Response(null, { status: 415 });

  const etag = `"${course.updatedAt.getTime()}"`;
  if (request.headers.get("if-none-match") === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag, "Cache-Control": "private, max-age=3600" } });
  }

  return new Response(Buffer.from(match[2], "base64"), {
    headers: {
      "Content-Type": match[1],
      "Cache-Control": "private, max-age=3600",
      ETag: etag,
    },
  });
}
