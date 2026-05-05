import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  const gateway = await prisma.paymentGatewayConfig.findUnique({
    where: { provider: provider.toUpperCase() },
  });

  if (!gateway || !gateway.isEnabled) {
    return NextResponse.json({ enabled: false, config: null });
  }

  return NextResponse.json({
    enabled: true,
    config: gateway.extraConfig ?? {},
  });
}
