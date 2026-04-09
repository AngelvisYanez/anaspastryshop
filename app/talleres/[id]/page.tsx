import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TallerDetailClient from "./TallerDetailClient";

export default async function TallerDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const taller = await prisma.taller.findUnique({
    where: { id },
    include: {
      instructor: {
        select: { name: true, image: true, email: true },
      },
      modules: {
        orderBy: { order: "asc" },
        include: {
          topics: {
            orderBy: { order: "asc" }
          }
        }
      }
    },
  });

  if (!taller) return notFound();

  return <TallerDetailClient taller={taller} />;
}
