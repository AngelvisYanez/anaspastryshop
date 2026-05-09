import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GRACE_DAYS } from "@/lib/utils/subscription";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const graceCutoff = new Date(Date.now() - GRACE_DAYS * 24 * 60 * 60 * 1000);

  const { count } = await prisma.subscription.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: graceCutoff },
    },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({ expired: count, cutoff: graceCutoff.toISOString() });
}
