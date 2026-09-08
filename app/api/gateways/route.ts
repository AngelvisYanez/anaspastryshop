import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const gateways = await prisma.paymentGatewayConfig.findMany({
      where: { isEnabled: true },
      select: {
        provider: true,
        extraConfig: true,
      },
    });

    return NextResponse.json({
      gateways: gateways.map((g) => ({
        provider: g.provider,
        config: (g.extraConfig as Record<string, any>) ?? {},
      })),
    });
  } catch (error) {
    console.error("Error fetching gateways:", error);
    return NextResponse.json({ gateways: [] }, { status: 500 });
  }
}
