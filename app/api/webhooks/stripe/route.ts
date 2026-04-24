import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { type, userId, cursoId } = session.metadata ?? {};

    if (type === "course" && userId && cursoId) {
      await prisma.coursePurchase.upsert({
        where: { userId_cursoId: { userId, cursoId } },
        create: {
          userId,
          cursoId,
          amount: (session.amount_total ?? 0) / 100,
          status: "COMPLETED",
          stripePaymentIntentId: session.payment_intent as string,
        },
        update: {
          status: "COMPLETED",
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      await prisma.inscription.upsert({
        where: { id: `stripe_${userId}_${cursoId}` },
        create: {
          id: `stripe_${userId}_${cursoId}`,
          userId,
          cursoId,
          method: "STRIPE",
          amountPaid: (session.amount_total ?? 0) / 100,
          status: "APPROVED",
        },
        update: { status: "APPROVED" },
      });
    }

    if (type === "subscription" && userId) {
      const plan = await prisma.subscriptionPlan.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      });

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: plan?.slug ?? "base",
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
        },
        update: {
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
        },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    await prisma.subscription.updateMany({
      where: { stripeCustomerId: customerId },
      data: { status: "CANCELED" },
    });
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    const status = sub.status === "active" ? "ACTIVE" : sub.status === "past_due" ? "PAST_DUE" : "CANCELED";
    await prisma.subscription.updateMany({
      where: { stripeCustomerId: customerId },
      data: { status },
    });
  }

  return NextResponse.json({ received: true });
}
