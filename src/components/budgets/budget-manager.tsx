"use client";

import { useState, useTransition } from "react";
import { useTranslations, useLocale } from "next-intl";
import { deleteBudget, saveBudget } from "@/actions/budgets";
import { formatCurrency, getLocaleConfig } from "@/lib/utils";
import type { Budget, Category } from "@/types";

export function BudgetManager({ categories, budgets, month }: { categories: Category[]; budgets: Budget[]; month: string }) {
  const t = useTranslations("budgets");
  const locale = useLocale();
  const { intlLocale, currency } = getLocaleConfig(locale);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await saveBudget(data);
      if (result.error) setError(result.error);
    });
  }
  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteBudget(id);
      if (result.error) setError(result.error);
    });
  }
  return <div className="space-y-6">
    <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1><p className="text-sm text-gray-500 mt-1">{t("description")}</p></div>
    <form onSubmit={submit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
      <div><label className="block text-sm font-medium mb-1">{t("category")}</label><select name="category_id" required className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm"><option value="">{t("selectCategory")}</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div><label className="block text-sm font-medium mb-1">{t("month")}</label><input name="month" type="month" defaultValue={month} required className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" /></div>
      <div><label className="block text-sm font-medium mb-1">{t("amount", { currency })}</label><input name="amount" type="number" step="0.01" min="0.01" required className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 text-sm" /></div>
      <button disabled={pending} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50">{t("save")}</button>
    </form>
    {error && <p className="text-sm text-red-600">{error}</p>}
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <table className="w-full text-sm"><thead className="bg-gray-50 dark:bg-gray-800/60"><tr><th className="text-left px-4 sm:px-6 py-3 font-medium text-gray-500">{t("category")}</th><th className="text-right px-4 sm:px-6 py-3 font-medium text-gray-500">{t("amountHeader")}</th><th className="px-4 sm:px-6 py-3" /></tr></thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">{budgets.map((budget) => <tr key={budget.id}><td className="px-4 sm:px-6 py-4 text-gray-900 dark:text-white">{categories.find((c) => c.id === budget.category_id)?.name ?? t("unknownCategory")}</td><td className="px-4 sm:px-6 py-4 text-right font-semibold">{formatCurrency(budget.amount, intlLocale, currency)}</td><td className="px-4 sm:px-6 py-4 text-right"><button onClick={() => remove(budget.id)} className="text-sm text-red-600">{t("delete")}</button></td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}
