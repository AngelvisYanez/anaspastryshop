"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseRange, type DateRange } from "../data-view/filters";
import { logFilters } from "./log-filters";

export async function getLogReport(search: string, action: string, range: DateRange) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("No autorizado");

  return prisma.activityLog.findMany({
    where: logFilters(search, action, parseRange(range.from, range.to)),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      createdAt: true, action: true, entityType: true, details: true,
      user: { select: { name: true, email: true } },
    },
  });
}
