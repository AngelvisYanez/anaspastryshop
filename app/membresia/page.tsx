import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MembresiaClient from "./MembresiaClient";
import { prisma } from "@/lib/prisma";
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
  const { plan, sections, enabledProviders } = await getMembresiaData();

  return (
    <main id="main-content" className="min-h-screen bg-background pb-20">
      <Navbar />
      <MembresiaClient plan={plan as any} sections={sections} enabledProviders={enabledProviders} />
      <Footer />
    </main>
  );
}
