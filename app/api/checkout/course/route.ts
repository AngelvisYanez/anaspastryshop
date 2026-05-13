import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { cursoId } = await req.json();
  if (!cursoId) {
    return NextResponse.json({ error: "cursoId requerido" }, { status: 400 });
  }

  const curso = await prisma.curso.findUnique({ where: { id: cursoId } });
  if (!curso) {
    return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
  }

  const existing = await prisma.coursePurchase.findUnique({
    where: { userId_cursoId: { userId: session.user.id, cursoId } },
  });
  if (existing?.status === "COMPLETED") {
    return NextResponse.json({ error: "Ya tienes acceso a este curso" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: curso.title,
              description: curso.description.substring(0, 200),
              images: curso.image ? [curso.image] : [],
            },
            unit_amount: Math.round(curso.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "course",
        cursoId,
        userId: session.user.id,
      },
      success_url: `${baseUrl}/pagar/confirmacion?session_id={CHECKOUT_SESSION_ID}&type=course`,
      cancel_url: `${baseUrl}/cursos/${cursoId}`,
    });

    await prisma.coursePurchase.upsert({
      where: { userId_cursoId: { userId: session.user.id, cursoId } },
      create: {
        userId: session.user.id,
        cursoId,
        amount: curso.price,
        status: "PENDING",
        stripePaymentIntentId: checkoutSession.payment_intent as string,
      },
      update: {
        status: "PENDING",
        stripePaymentIntentId: checkoutSession.payment_intent as string,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Error al procesar el pago. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
