"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { createExpense, updateExpense } from "@/actions/expenses";
import { todayISO, getLocaleConfig } from "@/lib/utils";
import type { ExpenseWithPaymentType, PaymentType } from "@/types";

interface Props {
  paymentTypes: PaymentType[];
  existing?: ExpenseWithPaymentType;
}

export function ExpenseForm({ paymentTypes, existing }: Props) {
  const t = useTranslations("expenseForm");
  const locale = useLocale();
  const { currency } = getLocaleConfig(locale);

  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          {t("descriptionLabel")} <span className="text-red-500">*</span>
        </label>
        <input
          id="description"
          name="description"
          type="text"
          defaultValue={existing?.description ?? ""}
          required
          maxLength={500}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("descriptionPlaceholder")}
        />
        {field("description") && (
          <p className="text-xs text-red-600 mt-1">{field("description")}</p>
        )}
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
          {t("amountLabel", { currency })} <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={existing?.amount?.toString() ?? ""}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("amountPlaceholder")}
        />
        {field("amount") && (
          <p className="text-xs text-red-600 mt-1">{field("amount")}</p>
        )}
      </div>

      <div>
        <label htmlFor="payment_type_id" className="block text-sm font-medium text-gray-700 mb-1">
          {t("paymentTypeLabel")} <span className="text-red-500">*</span>
        </label>
        <select
          id="payment_type_id"
          name="payment_type_id"
          defaultValue={existing?.payment_type_id ?? ""}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">{t("paymentTypePlaceholder")}</option>
          {paymentTypes.map((pt) => (
            <option key={pt.id} value={pt.id}>
              {pt.name}
            </option>
          ))}
        </select>
        {field("payment_type_id") && (
          <p className="text-xs text-red-600 mt-1">{field("payment_type_id")}</p>
        )}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          {t("dateLabel")} <span className="text-red-500">*</span>
        </label>
        <input
          id="date"
          name="date"
          type="date"
          defaultValue={existing?.date ?? todayISO()}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {field("date") && (
          <p className="text-xs text-red-600 mt-1">{field("date")}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          {t("notesLabel")}
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={existing?.notes ?? ""}
          maxLength={1000}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder={t("notesPlaceholder")}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg"
        >
          {isPending ? t("saving") : existing ? t("updateExpense") : t("addExpense")}
        </button>
        <Link
          href="/expenses"
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg"
        >
          {t("cancel")}
        </Link>
      </div>
    </form>
  );
}
