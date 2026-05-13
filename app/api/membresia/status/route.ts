import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSubscriptionValid } from "@/lib/utils/subscription";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [subscription, pendingInscription] = await Promise.all([
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, endDate: true },
    }),
    prisma.inscription.findFirst({
      where: { userId: session.user.id, cursoId: null, status: "PENDING" },
      select: { id: true },
    }),
  ]);

  const hasActiveSubscription = subscription
    ? isSubscriptionValid(subscription)
    : false;

  const hasPendingPayment = !!pendingInscription && !hasActiveSubscription;

  return NextResponse.json({ hasActiveSubscription, hasPendingPayment });
}
