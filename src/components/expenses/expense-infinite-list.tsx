"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getExpenses } from "@/actions/expenses";
import { DeleteExpenseBtn } from "./delete-expense-btn";
import { Spinner } from "@/components/ui/spinner";
import { LinkPendingIndicator } from "@/components/ui/link-pending-indicator";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ExpenseWithPaymentType } from "@/types";

interface Props {
  initialExpenses: ExpenseWithPaymentType[];
  initialCount: number;
  dateFrom: string;
  dateTo: string;
  paymentTypeId?: string;
  categoryId?: string;
  intlLocale: string;
  currency: string;
}

export function ExpenseInfiniteList({
  initialExpenses,
  initialCount,
  dateFrom,
  dateTo,
  paymentTypeId,
  categoryId,
  intlLocale,
  currency,
}: Props) {
  const t = useTranslations("expenses");
  const [expenses, setExpenses] = useState<ExpenseWithPaymentType[]>(initialExpenses);
  const [totalCount, setTotalCount] = useState<number>(initialCount);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(initialExpenses.length < initialCount);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleDeleted = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setError(null);

    const nextPage = page + 1;
    try {
      const result = await getExpenses({
        dateFrom,
        dateTo,
        paymentTypeId,
        categoryId,
        page: nextPage,
        perPage: 25,
      });

      setExpenses((prev) => {
        const existingIds = new Set(prev.map((e) => e.id));
        const newUnique = result.expenses.filter((e) => !existingIds.has(e.id));
        const updated = [...prev, ...newUnique];
        const moreAvailable = result.expenses.length === 25 && updated.length < result.count;
        setHasMore(moreAvailable);
        return updated;
      });

      setTotalCount(result.count);
      setPage(nextPage);
    } catch (err: unknown) {
      console.error("Failed to load more expenses:", err);
      setError(err instanceof Error ? err.message : "Error loading more expenses");
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, dateFrom, dateTo, paymentTypeId, categoryId]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "250px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, loadMore]);

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-gray-500">
        {t("noExpenses")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {totalCount <= 25
          ? t("expenseCount", { count: totalCount })
          : t("showingCount", { count: totalCount, loaded: expenses.length })}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Mobile card list */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800 md:hidden">
          {expenses.map((e) => (
            <div key={e.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{e.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(e.date, intlLocale)}</p>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white text-sm shrink-0">
                  {formatCurrency(Number(e.amount), intlLocale, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 max-w-[150px] truncate">
                    {e.category_name ?? t("uncategorized")}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
                    {e.payment_type_name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/expenses/${e.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <LinkPendingIndicator className="h-3.5 w-3.5" />
                    {t("edit")}
                  </Link>
                  <DeleteExpenseBtn id={e.id} onDeleted={handleDeleted} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("dateHeader")}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("descriptionHeader")}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("categoryHeader")}</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("typeHeader")}</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("amountHeader")}</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(e.date, intlLocale)}
                  </td>
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                    {e.description}
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                    {e.category_name ?? t("uncategorized")}
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{e.payment_type_name}</td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(Number(e.amount), intlLocale, currency)}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-3 justify-end">
                      <Link
                        href={`/expenses/${e.id}`}
                        className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <LinkPendingIndicator className="h-3.5 w-3.5" />
                        {t("edit")}
                      </Link>
                      <DeleteExpenseBtn id={e.id} onDeleted={handleDeleted} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />

      {isLoading && (
        <div className="py-4 flex justify-center items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Spinner className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{t("loadingMore")}</span>
        </div>
      )}

      {error && (
        <div className="py-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-2">{t("loadMoreError")}</p>
          <button
            type="button"
            onClick={loadMore}
            className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {!hasMore && expenses.length > 25 && (
        <div className="py-4 text-center text-xs text-gray-400 dark:text-gray-500">
          {t("allLoaded")}
        </div>
      )}
    </div>
  );
}
