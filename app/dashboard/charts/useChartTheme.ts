"use client";

import { useLayoutEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export type ChartTheme = {
  accent: string;
  accentSolid: string;
  card: string;
  foreground: string;
  muted: string;
  border: string;
  palette: string[];
  tooltip: React.CSSProperties;
  axisTick: { fill: string; fontSize: number };
  tooltipLabelStyle: React.CSSProperties;
};

const FALLBACK: ChartTheme = {
  accent: "#C51E75",
  accentSolid: "#C51E75",
  card: "#ffffff",
  foreground: "#2B0938",
  muted: "#7A5B79",
  border: "#F3D9E8",
  palette: ["#C51E75", "#8B5CF6", "#06B6D4", "#A855F7", "#F43F5E"],
  tooltip: {
    borderRadius: "16px",
    border: "1px solid #F3D9E8",
    backgroundColor: "#ffffff",
    color: "#2B0938",
    boxShadow: "0 10px 15px -3px rgb(43 9 56 / 0.12)",
  },
  axisTick: { fill: "#7A5B79", fontSize: 10 },
  tooltipLabelStyle: { color: "#2B0938", fontWeight: 700 },
};

function readVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/**
 * Recharts escribe los colores como atributos/atributos de estilo en SVG, así que no
 * lee clases de Tailwind. Resolvemos los tokens reales de `globals.css` para que las
 * gráficas respeten el tema en vez de llevar una paleta duplicada en JS.
 */
export function useChartTheme(): ChartTheme {
  const { theme } = useTheme();
  const [chartTheme, setChartTheme] = useState<ChartTheme>(FALLBACK);

  useLayoutEffect(() => {
    const accent = readVar("--accent", FALLBACK.accent);
    const card = readVar("--card", FALLBACK.card);
    const foreground = readVar("--foreground", FALLBACK.foreground);
    const muted = readVar("--muted", FALLBACK.muted);
    const border = readVar("--card-border", FALLBACK.border);

    setChartTheme({
      accent,
      accentSolid: readVar("--accent-solid", FALLBACK.accentSolid),
      card,
      foreground,
      muted,
      border,
      palette: [
        readVar("--accent-solid", FALLBACK.palette[0]),
        "#8B5CF6",
        readVar("--cyan-accent", FALLBACK.palette[2]),
        "#A855F7",
        "#F43F5E",
      ],
      tooltip: {
        borderRadius: "16px",
        border: `1px solid ${border}`,
        backgroundColor: card,
        color: foreground,
        boxShadow: "0 10px 15px -3px rgb(43 9 56 / 0.12)",
      },
      axisTick: { fill: muted, fontSize: 10 },
      tooltipLabelStyle: { color: foreground, fontWeight: 700 },
    });
  }, [theme]);

  return chartTheme;
}
