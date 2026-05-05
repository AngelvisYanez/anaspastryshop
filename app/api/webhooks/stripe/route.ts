import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type Stripe from "stripe";
import {
  sendSubscriptionConfirmedEmail,
  sendSubscriptionCanceledEmail,
  sendCoursePurchaseEmail,
} from "@/lib/email";

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

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
      const curso = await prisma.curso.findUnique({ where: { id: cursoId }, select: { title: true } });
      if (user && curso) {
        sendCoursePurchaseEmail(user.email, user.name, curso.title).catch(() => {});
      }
    }

    if (type === "subscription" && userId) {
      const planSlug = session.metadata?.planSlug;
      const plan = planSlug
        ? await prisma.subscriptionPlan.findFirst({ where: { slug: planSlug, isActive: true } })
        : await prisma.subscriptionPlan.findFirst({ where: { isActive: true }, orderBy: { price: "asc" } });

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: plan?.slug ?? "base",
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
        update: {
          plan: plan?.slug ?? "base",
          status: "ACTIVE",
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
      if (user) {
        sendSubscriptionConfirmedEmail(
          user.email,
          user.name,
          plan?.name ?? "Membresía Academia",
          (session.amount_total ?? 0) / 100
        ).catch(() => {});
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const customerId = sub.customer as string;
    await prisma.subscription.updateMany({
      where: { stripeCustomerId: customerId },
      data: { status: "CANCELED" },
    });
    const dbSub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId }, include: { user: { select: { email: true, name: true } } } });
    if (dbSub?.user) {
      sendSubscriptionCanceledEmail(dbSub.user.email, dbSub.user.name).catch(() => {});
    }
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
