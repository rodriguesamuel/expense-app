"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createPaymentType, updatePaymentType } from "@/actions/payment-types";
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          {t("nameLabel")}
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={existing?.name ?? ""}
          required
          maxLength={100}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("namePlaceholder")}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onDone}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg"
        >
          {isPending ? t("saving") : existing ? t("update") : t("create")}
        </button>
      </div>
    </form>
  );
}
