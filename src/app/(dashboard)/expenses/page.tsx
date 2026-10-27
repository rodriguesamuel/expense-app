export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/i18n.server";
import { getExpenses } from "@/actions/expenses";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseInfiniteList } from "@/components/expenses/expense-infinite-list";
import { LoadingState } from "@/components/ui/loading-state";
import { LinkPendingIndicator } from "@/components/ui/link-pending-indicator";
import { monthStartISO, monthEndISO, getLocaleConfig } from "@/lib/utils";

export const metadata = { title: "Expenses — Expense Tracker" };

interface PageProps {
  searchParams: Promise<{
    date_from?: string;
    date_to?: string;
    payment_type_id?: string;
    category_id?: string;
    page?: string;
  }>;
}

async function ExpenseTable({
  dateFrom,
  dateTo,
  paymentTypeId,
  categoryId,
  intlLocale,
  currency,
}: {
  dateFrom: string;
  dateTo: string;
  paymentTypeId?: string;
  categoryId?: string;
  intlLocale: string;
  currency: string;
}) {
  const { expenses, count } = await getExpenses({
    dateFrom,
    dateTo,
    paymentTypeId,
    categoryId,
    page: 1,
    perPage: 25,
  });

  return (
    <ExpenseInfiniteList
      key={`${dateFrom}_${dateTo}_${paymentTypeId || ""}_${categoryId || ""}`}
      initialExpenses={expenses}
      initialCount={count}
      dateFrom={dateFrom}
      dateTo={dateTo}
      paymentTypeId={paymentTypeId}
      categoryId={categoryId}
      intlLocale={intlLocale}
      currency={currency}
    />
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
  const categoryId = params.category_id;

  const [{ data: paymentTypes }, { data: categories }] = await Promise.all([
    supabase
      .from("payment_types")
      .select("*")
      .eq("user_id", user.id)
      .order("name"),
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("name"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <Link
          href="/expenses/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shrink-0 transition-colors"
        >
          <LinkPendingIndicator />
          {t("addExpense")}
        </Link>
      </div>

      <Suspense>
        <ExpenseFilters
          paymentTypes={paymentTypes ?? []}
          categories={categories ?? []}
        />
      </Suspense>

      <Suspense fallback={<LoadingState className="py-8" />}>
        <ExpenseTable
          dateFrom={dateFrom}
          dateTo={dateTo}
          paymentTypeId={paymentTypeId}
          categoryId={categoryId}
          intlLocale={intlLocale}
          currency={currency}
        />
      </Suspense>
    </div>
  );
}
