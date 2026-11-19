"use client";

import { Area, Bar, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useId } from "react";
import { useChartTheme } from "../charts/useChartTheme";
import type { ChartItem } from "./overview";
import type { ChartStyle } from "./widgets";

const money = new Intl.NumberFormat("es-VE", { style: "currency", currency: "USD", currencyDisplay: "code" });
const number = new Intl.NumberFormat("es-VE");
const axisNumber = new Intl.NumberFormat("es-VE", { notation: "compact", maximumFractionDigits: 1 });

export default function OverviewChart({ data, chart, label, currency, categorical }: {
  data: ChartItem[]; chart: ChartStyle; label: string; currency?: boolean; categorical?: boolean;
}) {
  const theme = useChartTheme();
  const gradient = useId();
  const format = currency ? money : number;
  const formatAxis = (value: number) => `${currency ? "$" : ""}${axisNumber.format(value)}`;
  const tooltip = {
    contentStyle: theme.tooltip,
    labelStyle: theme.tooltipLabelStyle,
    formatter: (value: unknown) => format.format(Number(value)),
  };

  if (data.length === 0 || data.every(({ value }) => value === 0)) {
    return <div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-card-border text-center text-sm text-muted">Sin datos para los filtros seleccionados.</div>;
  }

  if (chart === "donut") {
    const slices = data.filter(({ value }) => value > 0);
    return (
      <div className="grid min-w-0 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="h-44 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer>
              <Pie data={slices} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="86%" paddingAngle={2} isAnimationActive={false}>
                {slices.map((entry, index) => <Cell key={index} fill={theme.palette[index % theme.palette.length]} />)}
              </Pie>
              <Tooltip {...tooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="grid min-w-0 gap-2 text-xs text-muted">
          {slices.map(({ name, value }, index) => <li key={index} className="flex min-w-0 items-start gap-2">
            <span aria-hidden="true" className="mt-1 size-2 shrink-0 rounded-full" style={{ backgroundColor: theme.palette[index % theme.palette.length] }} />
            <span className="flex-1 break-words">{name}</span>
            <span className="font-semibold tabular-nums text-foreground">{format.format(value)}</span>
          </li>)}
        </ul>
      </div>
    );
  }

  return (
    <div className="h-60 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} layout={categorical ? "vertical" : "horizontal"} accessibilityLayer
          margin={{ top: 10, right: 12, bottom: 8, left: 0 }}>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.accent} stopOpacity={0.34} />
              <stop offset="100%" stopColor={theme.accent} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={theme.border} strokeDasharray="4 4" vertical={Boolean(categorical)} horizontal={!categorical} />
          {categorical ? <>
            <XAxis type="number" allowDecimals={currency} tickFormatter={formatAxis} tick={theme.axisTick} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" width={105} tick={theme.axisTick} tickLine={false} axisLine={false}
              tickFormatter={(value: string) => value.length > 17 ? `${value.slice(0, 16)}…` : value} />
          </> : <>
            <XAxis type="category" dataKey="name" minTickGap={20} tick={theme.axisTick} tickLine={false} axisLine={false} />
            <YAxis type="number" width={54} allowDecimals={currency} tickFormatter={formatAxis} tick={theme.axisTick} tickLine={false} axisLine={false} />
          </>}
          <Tooltip {...tooltip} />
          {chart === "bar" && <Bar name={label} dataKey="value" fill={theme.accentSolid} radius={3} isAnimationActive={false} />}
          {chart === "line" && <Line name={label} dataKey="value" stroke={theme.accentSolid} strokeWidth={2.5} dot={data.length <= 12} isAnimationActive={false} />}
          {chart === "area" && <Area name={label} dataKey="value" stroke={theme.accentSolid} strokeWidth={2.5} fill={`url(#${gradient})`}
            dot={data.length === 1} isAnimationActive={false} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
