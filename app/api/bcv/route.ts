import { NextResponse } from "next/server";

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
    const res = await fetch("https://ve.dolarapi.com/v1/euros/oficial", {
      next: { revalidate: 900 },
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const rate = Number(data.promedio);
    if (Number.isFinite(rate) && rate > 0) {
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
  const source = "DolarApi (Euro oficial BCV)";

  // 1. Intentar API primaria
  result = await fetchFromDolarApi();

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
      error: "No se pudo obtener la tasa BCV del euro",
    },
    { status: 503 }
  );
}
