import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import LogsClient from "./LogsClient";

const PAGE_SIZE = 20;

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; action?: string }>;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search?.trim() ?? "";
  const action = params.action?.trim() ?? "";

  const where = {
    ...(search
      ? {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
    ...(action ? { action } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true, role: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return (
    <div>
      <p className="text-muted font-medium mb-6">Historial de actividad del sistema. Solo administradores.</p>
      <Suspense>
        <LogsClient
          logs={logs as any}
          total={total}
          page={page}
          search={search}
          action={action}
        />
      </Suspense>
    </div>
  );
}
