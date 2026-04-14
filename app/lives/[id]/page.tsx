import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LiveRoom from "./LiveRoom";

export default async function LiveRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { id } = await params;

  const live = await prisma.liveStream.findUnique({
    where: { id },
    select: { id: true, title: true, status: true },
  });

  if (!live) redirect("/lives");

  return (
    <div className="h-screen w-full overflow-hidden">
      <LiveRoom liveId={live.id} />
    </div>
  );
}
