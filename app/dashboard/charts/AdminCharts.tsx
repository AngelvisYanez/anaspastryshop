"use client";

import dynamic from "next/dynamic";

const GrowthChart = dynamic(() => import("./GrowthChart"), { ssr: false });
const RevenueChart = dynamic(() => import("./RevenueChart"), { ssr: false });
const PaymentMethodsChart = dynamic(() => import("./PaymentMethodsChart"), { ssr: false });

type DayData = { date: string; count: number };
type RevenueData = { date: string; revenue: number };
type PaymentData = { name: string; value: number };

export function AdminGrowthChart({ data }: { data: DayData[] }) {
  return <GrowthChart data={data} />;
}

export function AdminRevenueChart({ data }: { data: RevenueData[] }) {
  return <RevenueChart data={data} />;
}

export function AdminPaymentMethodsChart({ data }: { data: PaymentData[] }) {
  return <PaymentMethodsChart data={data} />;
}
