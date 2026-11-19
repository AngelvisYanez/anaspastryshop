"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateBounds, parseRange, type DateRange } from "../data-view/filters";

export async function getPaymentReport(range: DateRange) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado");

  return prisma.inscription.findMany({
    where: {
      status: { in: ["APPROVED", "REJECTED"] },
      updatedAt: dateBounds(parseRange(range.from, range.to)),
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: {
      updatedAt: true, method: true, status: true, amountPaid: true,
      user: { select: { name: true, email: true } },
      curso: { select: { title: true } },
    },
  });
}
