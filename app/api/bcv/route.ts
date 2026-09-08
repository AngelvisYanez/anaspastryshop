import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory cache de la tasa BCV para evitar saturar endpoints públicos
let cachedRate: {
  rate: number;
  date: string;
  source: string;
  cachedAt: number;
} | null = null;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

async function fetchFromDolarApi(): Promise<{ rate: number; date: string } | null> {
  try {
    const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
      next: { revalidate: 900 },
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const rate = typeof data.promedio === "number" ? data.promedio : parseFloat(data.promedio);
    if (rate && !isNaN(rate)) {
      return {
        rate,
        date: data.fechaActualizacion || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("[BCV] DolarApi fetch failed:", err);
  }
  return null;
}

async function fetchFromPyDolar(): Promise<{ rate: number; date: string } | null> {
  try {
    const res = await fetch("https://pydolarvenezuela-api.vercel.app/api/v1/dollar?page=bcv", {
      next: { revalidate: 900 },
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const rate = typeof data?.monitors?.usd?.price === "number"
      ? data.monitors.usd.price
      : parseFloat(data?.monitors?.usd?.price);
    if (rate && !isNaN(rate)) {
      return {
        rate,
        date: data?.monitors?.usd?.last_update || new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("[BCV] PyDolar fetch failed:", err);
  }
  return null;
}

export async function GET() {
  const now = Date.now();

  if (cachedRate && now - cachedRate.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      rate: cachedRate.rate,
      date: cachedRate.date,
      source: cachedRate.source,
      cached: true,
    });
  }

  let result: { rate: number; date: string } | null = null;
  let source = "DolarApi (Oficial BCV)";

  // 1. Intentar API primaria
  result = await fetchFromDolarApi();

  // 2. Si falla, intentar API secundaria
  if (!result) {
    result = await fetchFromPyDolar();
    source = "PyDolar (Oficial BCV)";
  }

  // 3. Fallback a configuración manual en PaymentGatewayConfig (PAGO_MOVIL)
  if (!result) {
    try {
      const pmGateway = await prisma.paymentGatewayConfig.findUnique({
        where: { provider: "PAGO_MOVIL" },
      });
      if (pmGateway) {
        const customRateStr = (pmGateway.extraConfig as Record<string, any>)?.customBcvRate;
        if (customRateStr) {
          const customRate = parseFloat(customRateStr);
          if (!isNaN(customRate) && customRate > 0) {
            result = { rate: customRate, date: pmGateway.updatedAt.toISOString() };
            source = "Configuración Manual Admin";
          }
        }
      }
    } catch (e) {
      console.warn("[BCV] Error reading DB fallback:", e);
    }
  }

  // 4. Si aún no hay resultado y teníamos una tasa previa en memoria, usarla
  if (!result && cachedRate) {
    return NextResponse.json({
      success: true,
      rate: cachedRate.rate,
      date: cachedRate.date,
      source: `${cachedRate.source} (Expirado)`,
      cached: true,
    });
  }

  if (result) {
    cachedRate = {
      rate: result.rate,
      date: result.date,
      source,
      cachedAt: now,
    };

    return NextResponse.json({
      success: true,
      rate: result.rate,
      date: result.date,
      source,
      cached: false,
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: "No se pudo obtener la tasa oficial del BCV",
    },
    { status: 503 }
  );
}
