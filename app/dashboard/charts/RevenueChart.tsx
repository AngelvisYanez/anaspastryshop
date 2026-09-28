"use client";
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import -- this whole module is the dynamic boundary; `AdminCharts` already loads it through `next/dynamic`, so `recharts` is never in the initial bundle
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useChartTheme } from "./useChartTheme";

type DataPoint = {
  date: string;
  revenue: number;
};

export default function RevenueChart({ data }: { data: DataPoint[] }) {
  const t = useChartTheme();

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={t.accent} stopOpacity={0.3} />
              <stop offset="95%" stopColor={t.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={t.axisTick}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={t.axisTick}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={t.tooltip}
            labelStyle={t.tooltipLabelStyle}
            formatter={(value) => [`$${value}`, "Ingresos"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={t.accent}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
