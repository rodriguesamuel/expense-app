"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { createExpense, updateExpense } from "@/actions/expenses";
import { todayISO, getLocaleConfig, calculatePaymentDates, splitInstallmentAmounts, formatDate, formatCurrency } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { LinkPendingIndicator } from "@/components/ui/link-pending-indicator";
import type { Category, ExpenseWithPaymentType, PaymentType } from "@/types";

interface Props {
  paymentTypes: PaymentType[];
  categories: Category[];
  existing?: ExpenseWithPaymentType;
}

export function ExpenseForm({ paymentTypes, categories, existing }: Props) {
  const t = useTranslations("expenseForm");
  const locale = useLocale();
  const { currency } = getLocaleConfig(locale);

  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [paymentTypeId, setPaymentTypeId] = useState(existing?.payment_type_id ?? "");
  const [installmentCount, setInstallmentCount] = useState(existing?.installment_count ?? 1);
  const [amount, setAmount] = useState(
    existing ? (Number(existing.amount) * (existing.installment_count ?? 1)).toFixed(2) : ""
  );
  const [purchaseDate, setPurchaseDate] = useState(existing?.date ?? todayISO());
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setErrors({});
    startTransition(async () => {
      const result = existing
        ? await updateExpense(existing.id, formData)
        : await createExpense(formData);
      if (result?.error) setError(result.error);
      if (result?.errors) setErrors(result.errors);
    });
  }

  function field(name: string) {
    return errors[name]?.[0];
  }

  const selectedPaymentType = paymentTypes.find((paymentType) => paymentType.id === paymentTypeId);
  const installmentPreview = useMemo(() => {
    if (selectedPaymentType?.type !== "credit_card" || !selectedPaymentType.cutoff_day || !selectedPaymentType.due_day) {
      return [];
    }
    return calculatePaymentDates(purchaseDate, selectedPaymentType.cutoff_day, selectedPaymentType.due_day, installmentCount)
      .map((date, index) => ({ date, amount: splitInstallmentAmounts(Number(amount) || 0, installmentCount)[index] }));
  }, [selectedPaymentType, purchaseDate, amount, installmentCount]);

  return (
    <form method="post" onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t("descriptionLabel")} <span className="text-red-500">*</span>
        </label>
        <input
          id="description"
          name="description"
          type="text"
          defaultValue={existing?.description ?? ""}
          required
          maxLength={500}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("descriptionPlaceholder")}
        />
        {field("description") && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {field("description")}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="category_id"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t("categoryLabel")}
        </label>
        <select
          id="category_id"
          name="category_id"
          defaultValue={existing?.category_id ?? ""}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t("categoryPlaceholder")}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t("amountLabel", { currency })}{" "}
          <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("amountPlaceholder")}
        />
        {field("amount") && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {field("amount")}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="payment_type_id"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t("paymentTypeLabel")} <span className="text-red-500">*</span>
        </label>
        <select
          id="payment_type_id"
          name="payment_type_id"
          value={paymentTypeId}
          onChange={(event) => {
            setPaymentTypeId(event.target.value);
            const nextType = paymentTypes.find((paymentType) => paymentType.id === event.target.value);
            if (nextType?.type !== "credit_card") setInstallmentCount(1);
          }}
          required
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option
            value=""
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {t("paymentTypePlaceholder")}
          </option>
          {paymentTypes.map((pt) => (
            <option
              key={pt.id}
              value={pt.id}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {pt.name}
            </option>
          ))}
        </select>
        {field("payment_type_id") && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {field("payment_type_id")}
          </p>
        )}
      </div>

      {selectedPaymentType?.type === "credit_card" && (
        <div className="space-y-3 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-3">
          <div>
            <label htmlFor="installment_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("installmentCount")}
            </label>
            <input
              id="installment_count"
              name="installment_count"
              type="number"
              min="1"
              max="120"
              value={installmentCount}
              onChange={(event) => setInstallmentCount(Math.max(1, Number(event.target.value) || 1))}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {installmentPreview.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium mb-1">{t("installmentPreview")}</p>
              <ul className="space-y-1">
                {installmentPreview.map((item, index) => (
                  <li key={`${item.date}-${index}`} className="flex justify-between">
                    <span>{index + 1}/{installmentCount}</span>
                    <span>{formatDate(item.date, locale === "pt" ? "pt-BR" : "en-US")} · {formatCurrency(item.amount, currency === "BRL" ? "pt-BR" : "en-US", currency)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t("dateLabel")} <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={purchaseDate}
          onChange={(event) => setPurchaseDate(event.target.value)}
          required
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {field("date") && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {field("date")}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {t("notesLabel")}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={existing?.notes ?? ""}
          maxLength={1000}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder={t("notesPlaceholder")}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          {isPending && <Spinner />}
          {isPending
            ? t("saving")
            : existing
              ? t("updateExpense")
              : t("addExpense")}
        </button>
        <Link
          href="/expenses"
          aria-disabled={isPending}
          className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors ${isPending ? "pointer-events-none opacity-50" : ""}`}
        >
          <LinkPendingIndicator />
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
