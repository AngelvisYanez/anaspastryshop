import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const existing = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (existing?.status === "ACTIVE") {
    return NextResponse.json({ error: "Ya tienes una suscripción activa" }, { status: 400 });
  }

  const siteConfig = await prisma.siteConfig.findFirst();
  const subscriptionPrice = siteConfig?.subscriptionPriceId;
  const amount = siteConfig?.subscriptionPrice ?? 97;

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  let checkoutParams: Parameters<typeof stripe.checkout.sessions.create>[0];

  if (subscriptionPrice) {
    checkoutParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: subscriptionPrice, quantity: 1 }],
      metadata: { type: "subscription", userId: session.user.id },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
      cancel_url: `${baseUrl}/planes`,
    };
  } else {
    checkoutParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Membresía Academia Credito USA" },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: { type: "subscription", userId: session.user.id },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
      cancel_url: `${baseUrl}/planes`,
    };
  }

  const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);

  return NextResponse.json({ url: checkoutSession.url });
}
