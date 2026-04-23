import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LiveRoom from "./LiveRoom";
import { joinLiveRoom } from "@/lib/actions/lives";

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

  const result = await joinLiveRoom(id);
  const token = "token" in result ? result.token : null;
  const tokenError = "error" in result ? result.error : null;

  return (
    <div className="h-screen w-full overflow-hidden">
      <LiveRoom liveId={live.id} token={token} tokenError={tokenError} />
    </div>
  );
}
