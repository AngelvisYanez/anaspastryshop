import { prisma } from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PlanesClient from "./PlanesClient";

export default async function PlanesPage() {
  const [plans, sections] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
    prisma.platformSection.findMany({
      where: { isActive: true },
      select: { id: true, name: true, icon: true },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#F8F4EE] pt-32 pb-20">
      <Navbar />
      <PlanesClient plans={plans as any} sections={sections} />
      <Footer />
    </main>
  );
}
