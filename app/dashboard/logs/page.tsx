import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LogsClient from "./LogsClient";
import { DashboardPage } from "../DashboardPage";

import { logFilters } from "./log-filters";
import { parsePage, parsePageSize, parseRange } from "../data-view/filters";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; action?: string; from?: string; to?: string; size?: string; view?: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const size = parsePageSize(params.size, 20);
  const range = parseRange(params.from, params.to);
  const search = params.search?.trim() ?? "";
  const action = params.action?.trim() ?? "";

  const where = logFilters(search, action, range);
  const total = await prisma.activityLog.count({ where });
  const page = Math.min(parsePage(params.page), Math.max(1, Math.ceil(total / size)));
  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: { user: { select: { name: true, email: true, role: true } } },
    skip: (page - 1) * size,
    take: size,
  });

  return (
    <DashboardPage
      title="Registro de Eventos"
      description="Historial de actividad del sistema. Solo administradores."
    >
      <Suspense>
        <LogsClient
          logs={logs}
          total={total}
          page={page}
          size={size}
          range={range}
          mode={params.view === "grid" ? "grid" : "list"}
          search={search}
          action={action}
        />
      </Suspense>
    </DashboardPage>
  );
}
