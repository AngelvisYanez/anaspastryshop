"use client";
// react-doctor-disable-next-line react-doctor/prefer-dynamic-import -- this whole module is the dynamic boundary; `AdminCharts` already loads it through `next/dynamic`, so `recharts` is never in the initial bundle
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useChartTheme } from "./useChartTheme";

type DataPoint = {
  name: string;
  value: number;
};

export default function PaymentMethodsChart({ data }: { data: DataPoint[] }) {
  const t = useChartTheme();

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={t.palette[index % t.palette.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={t.tooltip}
            labelStyle={t.tooltipLabelStyle}
            formatter={(value) => [`$${value}`, "Total"]}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
