import { auth } from "@/lib/auth";
import { avatarPath } from "@/lib/avatar";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user.id || (session.user.id !== id && session.user.role !== "ADMIN")) {
    return new Response(null, { status: 404 });
  }
  if (session.user.id !== id) {
    const admin = await prisma.user.findUnique({
      where: { id: session.user.id, role: "ADMIN", isActive: true },
      select: { id: true },
    });
    if (!admin) return new Response(null, { status: 404 });
  }

  const avatar = await prisma.userAvatar.findUnique({
    where: { userId: id },
    select: { data: true, user: { select: { image: true } } },
  });
  const version = new URL(request.url).searchParams.get("v");
  if (!avatar || !version || avatar.user.image !== `${avatarPath}${id}?v=${version}`) {
    return new Response(null, { status: 404 });
  }
  return new Response(Uint8Array.from(avatar.data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
