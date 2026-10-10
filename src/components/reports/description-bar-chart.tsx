"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import type { DescriptionSummaryItem } from "@/types";

const COLORS = ["#6366f1", "#3b82f6", "#0ea5e9", "#10b981", "#f59e0b", "#ec4899"];

interface Props {
  data: DescriptionSummaryItem[];
  intlLocale?: string;
  currency?: string;
  topCount?: number;
}

export function DescriptionBarChart({
  data,
  intlLocale = "pt-BR",
  currency = "BRL",
  topCount = 5,
}: Props) {
  const t = useTranslations("reports");
  const chartT = useTranslations("charts");

  if (!data || data.length === 0) {
    return null;
  }

  const topItems = data.slice(0, topCount);
  const remainingItems = data.slice(topCount);

  const chartData: Array<{
    description: string;
    total: number;
    count: number;
    percentage: number;
    isOther: boolean;
  }> = topItems.map((item) => ({
    description: item.description,
    total: item.total,
    count: item.count,
    percentage: item.percentage,
    isOther: false,
  }));

  if (remainingItems.length > 0) {
    const otherTotal = Number(
      remainingItems.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)
    );
    const otherCount = remainingItems.reduce((acc, curr) => acc + curr.count, 0);
    const otherPercentage = Number(
      remainingItems.reduce((acc, curr) => acc + curr.percentage, 0).toFixed(1)
    );

    chartData.push({
      description: t("other"),
      total: otherTotal,
      count: otherCount,
      percentage: otherPercentage,
      isOther: true,
    });
  }

  const chartHeight = Math.max(220, chartData.length * 40 + 30);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            new Intl.NumberFormat(intlLocale, {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(Number(v))
          }
        />
        <YAxis
          type="category"
          dataKey="description"
          tick={{ fontSize: 12, fill: "#374151" }}
          axisLine={false}
          tickLine={false}
          width={110}
          tickFormatter={(val: string) =>
            val.length > 13 ? `${val.slice(0, 13)}…` : val
          }
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0].payload as (typeof chartData)[number];
            return (
              <div className="bg-white border border-gray-200 shadow-md rounded-lg p-2.5 text-xs">
                <p className="font-semibold text-gray-900 mb-1">{item.description}</p>
                <p className="text-gray-600">
                  <span className="font-medium">{chartT("total")}:</span>{" "}
                  {formatCurrency(item.total, intlLocale, currency)}
                </p>
                <p className="text-gray-500">
                  {item.count} {t("countHeader").toLowerCase()} ({item.percentage.toFixed(1)}%)
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="total" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isOther ? "#9ca3af" : COLORS[index % COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

