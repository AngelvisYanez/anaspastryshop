import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const version = new URL(request.url).searchParams.get('v');
  const course = await prisma.curso.findUnique({
    where: { id },
    select: { image: true, status: true, publishedAt: true, updatedAt: true },
  });
  if (!course || (course.status !== 'PUBLISHED' && !(course.status === 'SCHEDULED' && course.publishedAt && course.publishedAt <= new Date()))) {
    return new Response(null, { status: 404 });
  }
  const image = course.image;
  if (!image) return new Response(null, { status: 404 });
  if (/^https?:\/\//i.test(image)) return Response.redirect(image);
  if (image.startsWith('/')) return Response.redirect(new URL(image, request.url));

  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([\s\S]+)$/i.exec(image);
  if (!match) return new Response(null, { status: 415 });

  const etag = `"${course.updatedAt.getTime()}"`;
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, { status: 304, headers: { ETag: etag } });
  }

  // Versioned URLs (`?v=`) are immutable; unversioned callers must revalidate.
  const cacheControl = version
    ? 'public, max-age=31536000, immutable'
    : 'public, max-age=0, must-revalidate';

  return new Response(Buffer.from(match[2], 'base64'), {
    headers: {
      'Content-Type': match[1],
      'Cache-Control': cacheControl,
      ETag: etag,
    },
  });
}
