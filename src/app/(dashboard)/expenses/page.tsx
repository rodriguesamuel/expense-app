export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/i18n.server";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { DeleteExpenseBtn } from "@/components/expenses/delete-expense-btn";
import { formatCurrency, formatDate, monthStartISO, monthEndISO, getLocaleConfig } from "@/lib/utils";

export const metadata = { title: "Expenses — Expense Tracker" };

interface PageProps {
  searchParams: Promise<{ date_from?: string; date_to?: string; payment_type_id?: string; page?: string }>;
}

async function ExpenseTable({ userId, dateFrom, dateTo, paymentTypeId, page, intlLocale, currency }: {
  userId: string;
  dateFrom: string;
  dateTo: string;
  paymentTypeId?: string;
  page: number;
  intlLocale: string;
  currency: string;
}) {
  const supabase = await createClient();
  const { t } = await getI18n("expenses");
  const perPage = 25;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("expenses_with_payment_type")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: false })
    .range(from, to);

  if (paymentTypeId) {
    query = query.eq("payment_type_id", paymentTypeId);
  }

  const { data: expenses, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / perPage);

  if (!expenses?.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        {t("noExpenses")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500">
        {t("expenseCount", { count: count ?? 0, page, totalPages })}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Mobile card list */}
        <div className="divide-y divide-gray-100 md:hidden">
          {expenses.map((e) => (
            <div key={e.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">{e.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(e.date, intlLocale)}</p>
                </div>
                <span className="font-semibold text-gray-900 text-sm shrink-0">
                  {formatCurrency(Number(e.amount), intlLocale, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 max-w-[150px] truncate">
                  {e.payment_type_name}
                </span>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/expenses/${e.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {t("edit")}
                  </Link>
                  <DeleteExpenseBtn id={e.id} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t("dateHeader")}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t("descriptionHeader")}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">{t("typeHeader")}</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">{t("amountHeader")}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(e.date, intlLocale)}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900 max-w-xs truncate">
                    {e.description}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{e.payment_type_name}</td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">
                    {formatCurrency(Number(e.amount), intlLocale, currency)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-3 justify-end">
                      <Link
                        href={`/expenses/${e.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {t("edit")}
                      </Link>
                      <DeleteExpenseBtn id={e.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default async function ExpensesPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { t, locale } = await getI18n("expenses");
  const { intlLocale, currency } = getLocaleConfig(locale);

  const params = await searchParams;
  const dateFrom = params.date_from ?? monthStartISO();
  const dateTo = params.date_to ?? monthEndISO();
  const paymentTypeId = params.payment_type_id;
  const page = parseInt(params.page ?? "1", 10);

  const { data: paymentTypes } = await supabase
    .from("payment_types")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <Link
          href="/expenses/new"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0"
        >
          {t("addExpense")}
        </Link>
      </div>

      <Suspense>
        <ExpenseFilters paymentTypes={paymentTypes ?? []} />
      </Suspense>

      <Suspense fallback={<div className="text-gray-400 py-8 text-center">{t("loading")}</div>}>
        <ExpenseTable
          userId={user.id}
          dateFrom={dateFrom}
          dateTo={dateTo}
          paymentTypeId={paymentTypeId}
          page={page}
          intlLocale={intlLocale}
          currency={currency}
        />
      </Suspense>
    </div>
  );
}
