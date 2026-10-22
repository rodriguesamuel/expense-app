"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createPaymentType, updatePaymentType } from "@/actions/payment-types";
import { Spinner } from "@/components/ui/spinner";
import type { PaymentType } from "@/types";

interface Props {
  existing?: PaymentType;
  onDone: () => void;
}

export function PaymentTypeForm({ existing, onDone }: Props) {
  const t = useTranslations("paymentTypeForm");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = existing
        ? await updatePaymentType(existing.id, formData)
        : await createPaymentType(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onDone();
      }
    });
  }

  return (
    <form method="post" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t("nameLabel")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={existing?.name ?? ""}
          required
          maxLength={100}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("namePlaceholder")}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onDone}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
        >
          {isPending && <Spinner />}
          {isPending ? t("saving") : existing ? t("update") : t("create")}
        </button>
      </div>
    </form>
  );
}
