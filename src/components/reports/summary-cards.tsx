"use client";

import { useTranslations, useLocale } from "next-intl";
import { formatCurrency, getLocaleConfig } from "@/lib/utils";

interface Props {
  total: number;
  count: number;
  dailyAverage: number;
}

export function SummaryCards({ total, count, dailyAverage }: Props) {
  const t = useTranslations("summaryCards");
  const locale = useLocale();
  const { intlLocale, currency } = getLocaleConfig(locale);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t("total")}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(total, intlLocale, currency)}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t("expenses")}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{t("dailyAverage")}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(dailyAverage, intlLocale, currency)}</p>
      </div>
    </div>
  );
}
