"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTranslations } from "next-intl";

interface Props {
  data: { month: string; total: number }[];
  intlLocale?: string;
  currency?: string;
}

export function MonthlyBarChart({ data, intlLocale = "pt-BR", currency = "BRL" }: Props) {
  const t = useTranslations("charts");

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#6b7280" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            new Intl.NumberFormat(intlLocale, { notation: "compact", maximumFractionDigits: 1 }).format(Number(v))
          }
        />
        <Tooltip
          formatter={(v) => [
            new Intl.NumberFormat(intlLocale, { style: "currency", currency }).format(Number(v)),
            t("total"),
          ]}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
