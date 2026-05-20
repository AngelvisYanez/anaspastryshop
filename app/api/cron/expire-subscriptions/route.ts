import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GRACE_DAYS } from "@/lib/utils/subscription";
import {
  sendSubscriptionExpiringSoonEmail,
  sendSubscriptionExpiredEmail,
} from "@/lib/email";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const graceCutoff = new Date(
    now.getTime() - GRACE_DAYS * 24 * 60 * 60 * 1000,
  );
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const fourDaysFromNow = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  // 1. Notificar a los que vencen en 3 días
  const expiringSoon = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      endDate: {
        gte: threeDaysFromNow,
        lt: fourDaysFromNow,
      },
    },
    include: { user: { select: { email: true, name: true } } },
  });

  for (const sub of expiringSoon) {
    await sendSubscriptionExpiringSoonEmail(sub.user.email, sub.user.name, 3);
  }

  // 2. Identificar suscripciones recién vencidas para enviar email y luego marcar como EXPIRED
  const justExpired = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: graceCutoff },
    },
    include: { user: { select: { email: true, name: true } } },
  });

  for (const sub of justExpired) {
    await sendSubscriptionExpiredEmail(sub.user.email, sub.user.name);
  }

  // 3. Marcar como EXPIRED en la DB
  const { count } = await prisma.subscription.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: graceCutoff },
    },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({
    expiredCount: count,
    notifiedExpiringSoon: expiringSoon.length,
    notifiedExpired: justExpired.length,
    cutoff: graceCutoff.toISOString(),
  });
}
