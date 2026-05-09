import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MembresiaClient from "./MembresiaClient";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isSubscriptionValid, subscriptionDaysLeft } from "@/lib/utils/subscription";
import { cacheTag, cacheLife } from "next/cache";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membresía",
  description:
    "Accede a todos los cursos, webinars en vivo y recursos de Academia Credito USA con una sola membresía. Invierte en tu educación financiera hoy.",
  openGraph: {
    title: "Membresía | Academia Credito USA",
    description: "Planes de membresía para acceder a formación financiera completa en español.",
  },
};

async function getMembresiaData() {
  "use cache";
  cacheLife("hours");
  cacheTag("planes", "plataforma-secciones", "gateways");
  const [plan, sections, gateways] = await Promise.all([
    prisma.subscriptionPlan.findFirst({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
    prisma.platformSection.findMany({
      where: { isActive: true },
      select: { id: true, name: true, icon: true },
    }),
    prisma.paymentGatewayConfig.findMany({
      where: { isEnabled: true },
      select: { provider: true },
    }),
  ]);
  const enabledProviders = gateways.map((g) => g.provider);
  return { plan, sections, enabledProviders };
}

export default async function MembresiaPage() {
  const [{ plan, sections, enabledProviders }, session] = await Promise.all([
    getMembresiaData(),
    auth(),
  ]);

  let activeSubscription: { daysLeft: number | null; endDate: string | null; planName: string } | null = null;

  if (session?.user) {
    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
      select: { status: true, endDate: true, plan: true },
    });
    if (sub && isSubscriptionValid(sub)) {
      const endDate = sub.endDate ?? null;
      const daysLeft = endDate ? subscriptionDaysLeft(endDate) : null;
      activeSubscription = {
        daysLeft,
        endDate: endDate
          ? new Date(endDate).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
          : null,
        planName: sub.plan,
      };
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-background pb-20">
      <Navbar />
      <MembresiaClient
        plan={plan as any}
        sections={sections}
        enabledProviders={enabledProviders}
        activeSubscription={activeSubscription}
      />
      <Footer />
    </main>
  );
}
