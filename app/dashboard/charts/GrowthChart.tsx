"use client";
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import -- this whole module is the dynamic boundary; `AdminCharts` already loads it through `next/dynamic`, so `recharts` is never in the initial bundle
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useChartTheme } from "./useChartTheme";

type DataPoint = {
  date: string;
  count: number;
};

export default function GrowthChart({ data }: { data: DataPoint[] }) {
  const t = useChartTheme();

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.border} />
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
          />
          <Tooltip
            contentStyle={t.tooltip}
            labelStyle={t.tooltipLabelStyle}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke={t.accent}
            strokeWidth={3}
            dot={{ r: 4, fill: t.accent, strokeWidth: 2, stroke: t.card }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
