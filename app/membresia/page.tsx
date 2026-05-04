import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MembresiaClient from "./MembresiaClient";
import { prisma } from "@/lib/prisma";

export default async function MembresiaPage() {
  const plan = await prisma.subscriptionPlan.findFirst({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  const sections = await prisma.platformSection.findMany({
    where: { isActive: true },
    select: { id: true, name: true, icon: true },
  });

  return (
    <main className="min-h-screen bg-background pt-32 pb-20">
      <Navbar />
      <MembresiaClient plan={plan as any} sections={sections} />
      <Footer />
    </main>
  );
}
