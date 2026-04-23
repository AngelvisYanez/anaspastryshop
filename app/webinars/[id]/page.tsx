import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WebinarRoom from "./WebinarRoom";
import { joinWebinarRoom } from "@/lib/actions/webinars";

export default async function WebinarRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { id } = await params;

  const webinar = await prisma.webinar.findUnique({
    where: { id },
    select: { id: true, title: true, status: true, instructorId: true },
  });

  if (!webinar) redirect("/webinars");

  const userId = session.user.id as string;
  const role = (session.user as any).role as string;
  const isHost = role === "ADMIN" || webinar.instructorId === userId;

  const result = await joinWebinarRoom(id);
  const token = "token" in result ? result.token : null;
  const tokenError = "error" in result ? result.error : null;

  return (
    <div className="h-screen w-full overflow-hidden">
      <WebinarRoom webinarId={webinar.id} isHost={isHost} token={token} tokenError={tokenError} />
    </div>
  );
}
