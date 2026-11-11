import { prisma } from '@/lib/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.galleryItem.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!item) return new Response(null, { status: 404 });
  const image = item.imageUrl;
  if (/^https?:\/\//i.test(image)) return Response.redirect(image);
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([\s\S]+)$/i.exec(image);
  if (!match) return new Response(null, { status: 415 });
  return new Response(Buffer.from(match[2], 'base64'), {
    headers: { 'Content-Type': match[1], 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
