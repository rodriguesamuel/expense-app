"use client";

import { useTranslations, useLocale } from "next-intl";
import { formatCurrency, getLocaleConfig } from "@/lib/utils";
import type { CategoryBudgetSummary } from "@/types";

export function CategoryBudgetReport({ rows }: { rows: CategoryBudgetSummary[] }) {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { intlLocale, currency } = getLocaleConfig(locale);
  return <section className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
    <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800"><h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">{t("byCategoryBudget")}</h2></div>
    <div className="overflow-x-auto"><table className="w-full text-sm min-w-[560px]"><thead className="bg-gray-50 dark:bg-gray-800/60"><tr>
      <th className="text-left px-4 sm:px-6 py-3 font-medium text-gray-500">{t("categoryHeader")}</th><th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500">{t("spentHeader")}</th><th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500">{t("budgetHeader")}</th><th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500">{t("differenceHeader")}</th>
    </tr></thead><tbody className="divide-y divide-gray-100 dark:divide-gray-800">{rows.map((row) => <tr key={row.categoryId}>
      <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 dark:text-white">{row.categoryName}</td><td className="px-4 sm:px-6 py-4 text-right">{formatCurrency(row.spent, intlLocale, currency)}</td><td className="px-4 sm:px-6 py-4 text-right">{row.budget ? formatCurrency(row.budget, intlLocale, currency) : "—"}</td><td className={`px-4 sm:px-6 py-4 text-right font-semibold ${row.difference < 0 ? "text-red-600" : "text-green-600"}`}>{row.budget ? formatCurrency(row.difference, intlLocale, currency) : "—"}</td>
    </tr>)}{rows.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">{t("noCategoryData")}</td></tr>}</tbody></table></div>
  </section>;
}
