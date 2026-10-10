"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/utils";
import type { DescriptionSummaryItem } from "@/types";

interface Props {
  data: DescriptionSummaryItem[];
  intlLocale?: string;
  currency?: string;
  topCount?: number;
}

export function DescriptionTable({
  data,
  intlLocale = "pt-BR",
  currency = "BRL",
  topCount = 5,
}: Props) {
  const t = useTranslations("reports");
  const [showAll, setShowAll] = useState(false);

  if (!data || data.length === 0) {
    return null;
  }

  const hasRemaining = data.length > topCount;

  let displayRows: Array<{
    id: string;
    description: string;
    count: number;
    total: number;
    percentage: number;
    isOther?: boolean;
  }>;

  if (!showAll && hasRemaining) {
    const topItems = data.slice(0, topCount).map((item, idx) => ({
      id: `top-${idx}-${item.description}`,
      description: item.description,
      count: item.count,
      total: item.total,
      percentage: item.percentage,
    }));

    const remaining = data.slice(topCount);
    const otherTotal = Number(
      remaining.reduce((sum, item) => sum + item.total, 0).toFixed(2)
    );
    const otherCount = remaining.reduce((sum, item) => sum + item.count, 0);
    const otherPercentage = Number(
      remaining.reduce((sum, item) => sum + item.percentage, 0).toFixed(1)
    );

    displayRows = [
      ...topItems,
      {
        id: "other-aggregate",
        description: t("other"),
        count: otherCount,
        total: otherTotal,
        percentage: otherPercentage,
        isOther: true,
      },
    ];
  } else {
    displayRows = data.map((item, idx) => ({
      id: `all-${idx}-${item.description}`,
      description: item.description,
      count: item.count,
      total: item.total,
      percentage: item.percentage,
    }));
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-full">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
          {t("detailByDescription")}
        </h3>
        {hasRemaining && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2.5 py-1 rounded-md transition-colors"
          >
            {showAll
              ? t("showTop", { count: topCount })
              : t("showAll", { count: data.length })}
          </button>
        )}
      </div>

      <div className="overflow-x-auto max-h-[340px] overflow-y-auto">
        <table className="w-full text-sm min-w-[340px]">
          <thead className="bg-gray-50 dark:bg-gray-800/90 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
            <tr>
              <th className="text-left px-4 sm:px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                {t("descriptionHeader")}
              </th>
              <th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                {t("countHeader")}
              </th>
              <th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                {t("totalHeader")}
              </th>
              <th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                {t("percentHeader")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {displayRows.map((row) => (
              <tr
                key={row.id}
                className={
                  row.isOther
                    ? "bg-gray-50/70 dark:bg-gray-800/40"
                    : "hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                }
              >
                <td className="px-4 sm:px-6 py-3 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="truncate max-w-[160px] sm:max-w-[220px]" title={row.description}>
                    {row.description}
                  </span>
                  {row.isOther && (
                    <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-normal">
                      {data.length - topCount} {t("countHeader").toLowerCase()}
                    </span>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-3 text-right text-gray-600 dark:text-gray-400">{row.count}</td>
                <td className="px-4 sm:px-6 py-3 text-right font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(row.total, intlLocale, currency)}
                </td>
                <td className="px-4 sm:px-6 py-3 text-right text-gray-500 dark:text-gray-400">
                  {row.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

