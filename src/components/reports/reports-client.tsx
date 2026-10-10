"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { monthStartISO, monthEndISO, formatCurrency, getLocaleConfig } from "@/lib/utils";
import { SummaryCards } from "./summary-cards";
import { PaymentTypePie } from "./payment-type-pie";
import { MonthlyBarChart } from "./monthly-bar-chart";
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
    if (!dateFrom || !dateTo) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    fetch(`/api/reports/summary?${params.toString()}`)
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => setError(t("failedLoad")))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo, t]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-3 sm:gap-4">
        <div className="col-span-1 min-w-0">
          <label className="block text-xs font-medium text-gray-500 mb-1">{t("from")}</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-1 min-w-0">
          <label className="block text-xs font-medium text-gray-500 mb-1">{t("to")}</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <CsvExportBtn dateFrom={dateFrom} dateTo={dateTo} />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {loading && (
        <div className="text-sm text-gray-400 py-8 text-center">{t("loading")}</div>
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
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">
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
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-800">{t("detailByType")}</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[340px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 sm:px-6 py-3 font-medium text-gray-500">{t("typeHeader")}</th>
                      <th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500">{t("countHeader")}</th>
                      <th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500">{t("totalHeader")}</th>
                      <th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500">{t("percentHeader")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {summary.byPaymentType.map((row) => (
                      <tr key={row.paymentTypeId}>
                        <td className="px-4 sm:px-6 py-3 font-medium text-gray-900">
                          {row.paymentTypeName}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-right text-gray-600">{row.count}</td>
                        <td className="px-4 sm:px-6 py-3 text-right font-semibold text-gray-900">
                          {formatCurrency(row.total, intlLocale, currency)}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-right text-gray-500">
                          {row.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!loading && summary && summary.count === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          {t("noExpenses")}
        </div>
      )}
    </div>
  );
}
