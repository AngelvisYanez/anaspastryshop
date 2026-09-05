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

  const [siteConfig, activePlan] = await Promise.all([
    prisma.siteConfig.findFirst(),
    prisma.subscriptionPlan.findFirst({
      where: { isActive: true },
      orderBy: { price: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const subscriptionPrice = siteConfig?.subscriptionPriceId;
  const amount = siteConfig?.subscriptionPrice ?? 97;
  const planSlug = activePlan?.slug ?? "base";
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const sharedMetadata = { type: "subscription", userId: session.user.id, planSlug };

  let checkoutParams: Parameters<typeof stripe.checkout.sessions.create>[0];

  if (subscriptionPrice) {
    checkoutParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: subscriptionPrice, quantity: 1 }],
      metadata: sharedMetadata,
      success_url: `${baseUrl}/pagar/confirmacion?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
      cancel_url: `${baseUrl}/pagar/membresia`,
    };
  } else {
    checkoutParams = {
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: activePlan?.name ?? "Membresía Academia Omnia" },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: sharedMetadata,
      success_url: `${baseUrl}/pagar/confirmacion?session_id={CHECKOUT_SESSION_ID}&type=subscription`,
      cancel_url: `${baseUrl}/pagar/membresia`,
    };
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe subscription checkout error:", err);
    return NextResponse.json(
      { error: "Error al procesar el pago. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
