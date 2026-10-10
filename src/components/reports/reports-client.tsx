"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { monthStartISO, monthEndISO, formatCurrency, getLocaleConfig } from "@/lib/utils";
import { SummaryCards } from "./summary-cards";
import { PaymentTypePie } from "./payment-type-pie";
import { MonthlyBarChart } from "./monthly-bar-chart";
import { DescriptionBarChart } from "./description-bar-chart";
import { DescriptionTable } from "./description-table";
import { CsvExportBtn } from "./csv-export-btn";
import type { ReportSummary } from "@/types";

export function ReportsClient() {
  const t = useTranslations("reports");
  const locale = useLocale();
  const { intlLocale, currency } = getLocaleConfig(locale);

  const [dateFrom, setDateFrom] = useState(monthStartISO());
  const [dateTo, setDateTo] = useState(monthEndISO());
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!dateFrom || !dateTo) return;

    const controller = new AbortController();
    const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });

    Promise.resolve().then(() => {
      if (!ignore) {
        setLoading(true);
        setError(null);
      }
    });

    fetch(`/api/reports/summary?${params.toString()}`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => {
        if (!ignore) setSummary(data);
      })
      .catch((err) => {
        if (!ignore && err?.name !== "AbortError") {
          setError(t("failedLoad"));
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [dateFrom, dateTo, t]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 sm:gap-4">
        <div className="col-span-1 min-w-0">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t("from")}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-1 min-w-0">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t("to")}</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <CsvExportBtn dateFrom={dateFrom} dateTo={dateTo} />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading && (
        <div className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">{t("loading")}</div>
      )}

      {!loading && summary && (
        <>
          <SummaryCards
            total={summary.total}
            count={summary.count}
            dailyAverage={summary.dailyAverage}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {summary.byPaymentType.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {t("byPaymentType")}
                </h2>
                <PaymentTypePie
                  data={summary.byPaymentType}
                  intlLocale={intlLocale}
                  currency={currency}
                />
              </div>
            )}

            {summary.byMonth.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  {t("monthlyBreakdown")}
                </h2>
                <MonthlyBarChart
                  data={summary.byMonth.map((m) => ({
                    month: new Date(m.month + "-01").toLocaleDateString(intlLocale, {
                      month: "short",
                      year: "2-digit",
                    }),
                    total: m.total,
                  }))}
                  intlLocale={intlLocale}
                  currency={currency}
                />
              </div>
            )}
          </div>

          {summary.byPaymentType.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">{t("detailByType")}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[340px]">
                  <thead className="bg-gray-50 dark:bg-gray-800/60">
                    <tr>
                      <th className="text-left px-4 sm:px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("typeHeader")}</th>
                      <th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("countHeader")}</th>
                      <th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("totalHeader")}</th>
                      <th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("percentHeader")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {summary.byPaymentType.map((row) => (
                      <tr key={row.paymentTypeId}>
                        <td className="px-4 sm:px-6 py-3 font-medium text-gray-900 dark:text-white">
                          {row.paymentTypeName}
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
          )}

          {summary.byDescription && summary.byDescription.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t("byDescriptionSection")}
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    {t("byDescriptionChart")}
                  </h3>
                  <DescriptionBarChart
                    data={summary.byDescription}
                    intlLocale={intlLocale}
                    currency={currency}
                  />
                </div>

                <DescriptionTable
                  data={summary.byDescription}
                  intlLocale={intlLocale}
                  currency={currency}
                />
              </div>
            </div>
          )}
        </>
      )}

      {!loading && summary && summary.count === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
          {t("noExpenses")}
        </div>
      )}
    </div>
  );
}
