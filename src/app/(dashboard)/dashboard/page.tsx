export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/i18n.server";
import { formatCurrency, formatDate, monthStartISO, monthEndISO, getLocaleConfig } from "@/lib/utils";
import { MonthlyBarChart } from "@/components/reports/monthly-bar-chart";
import { LinkPendingIndicator } from "@/components/ui/link-pending-indicator";

export const metadata = { title: "Dashboard — Expense Tracker" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { t, locale } = await getI18n("dashboard");
  const { intlLocale, currency } = getLocaleConfig(locale);

  const thisMonthStart = monthStartISO();
  const thisMonthEnd = monthEndISO();

  const { data: recentExpenses } = await supabase
    .from("expenses_with_payment_type")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: monthData } = await supabase
    .from("expenses")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", thisMonthStart)
    .lte("date", thisMonthEnd);

  const monthTotal = (monthData ?? []).reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  const sixMonthsAgoStr = sixMonthsAgo.toISOString().split("T")[0];

  const { data: chartData } = await supabase
    .from("expenses")
    .select("date, amount")
    .eq("user_id", user.id)
    .gte("date", sixMonthsAgoStr)
    .lte("date", thisMonthEnd);

  const byMonth: Record<string, number> = {};
  for (const e of chartData ?? []) {
    const month = e.date.slice(0, 7);
    byMonth[month] = (byMonth[month] ?? 0) + Number(e.amount);
  }
  const monthlyChartData = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({
      month: new Date(month + "-01").toLocaleDateString(intlLocale, {
        month: "short",
        year: "2-digit",
      }),
      total: Number(total.toFixed(2)),
    }));

  const expenseCount = monthData?.length ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t("welcome", { email: user.email ?? "" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("thisMonth")}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1 truncate">
            {formatCurrency(monthTotal, intlLocale, currency)}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {t("expenseCount", { count: expenseCount })}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex flex-col justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("quickActions")}</p>
          <div className="flex gap-2">
            <Link
              href="/expenses/new"
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <LinkPendingIndicator />
              {t("newExpense")}
            </Link>
            <Link
              href="/reports"
              className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <LinkPendingIndicator />
              {t("viewReports")}
            </Link>
          </div>
        </div>
      </div>

      {monthlyChartData.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 min-w-0">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {t("lastSixMonths")}
          </h2>
          <div className="w-full min-w-0 h-[220px]">
            <MonthlyBarChart data={monthlyChartData} intlLocale={intlLocale} currency={currency} />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200">{t("recentExpenses")}</h2>
          <Link href="/expenses" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            <LinkPendingIndicator className="h-3.5 w-3.5" />
            {t("seeAll")}
          </Link>
        </div>
        {recentExpenses?.length ? (
          <>
            {/* Mobile list view */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800 md:hidden">
              {recentExpenses.map((e) => (
                <div key={e.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate text-sm">{e.description}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDate(e.date, intlLocale)}</span>
                      <span>•</span>
                      <span className="truncate">{e.payment_type_name}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {formatCurrency(Number(e.amount), intlLocale, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {recentExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(e.date, intlLocale)}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                        {e.description}
                      </td>
                      <td className="px-6 py-3 text-gray-500 dark:text-gray-400">{e.payment_type_name}</td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(Number(e.amount), intlLocale, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="text-center py-10 text-sm text-gray-400 dark:text-gray-500">
            {t("noExpenses")}{" "}
            <Link href="/expenses/new" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline">
              <LinkPendingIndicator className="h-3.5 w-3.5" />
              {t("addFirst")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
