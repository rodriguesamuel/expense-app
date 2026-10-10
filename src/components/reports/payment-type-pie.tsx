"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTranslations } from "next-intl";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

interface Entry {
  paymentTypeName: string;
  total: number;
  percentage: number;
}

interface Props {
  data: Entry[];
  intlLocale?: string;
  currency?: string;
}

const renderLabel = ({ name, percent }: { name?: string; percent?: number }) => {
  if (!percent || percent < 0.05) return "";
  return `${name ?? ""} ${((percent ?? 0) * 100).toFixed(1)}%`;
};

export function PaymentTypePie({ data, intlLocale = "pt-BR", currency = "BRL" }: Props) {
  const t = useTranslations("charts");

  const chartData = data.map((d) => ({
    name: d.paymentTypeName,
    value: d.total,
    percentage: d.percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={renderLabel}
          labelLine={false}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [
            new Intl.NumberFormat(intlLocale, { style: "currency", currency }).format(Number(v)),
            t("total"),
          ]}
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            backgroundColor: "var(--chart-tooltip-bg, #ffffff)",
            borderColor: "var(--chart-tooltip-border, #e5e7eb)",
            color: "var(--chart-tooltip-text, #111827)",
          }}
          itemStyle={{
            color: "var(--chart-tooltip-text, #111827)",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => <span className="text-gray-700 dark:text-gray-300">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
