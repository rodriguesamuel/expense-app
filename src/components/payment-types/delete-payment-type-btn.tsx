"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deletePaymentType } from "@/actions/payment-types";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  id: string;
  name: string;
}

export function DeletePaymentTypeBtn({ id, name }: Props) {
  const t = useTranslations("deletePaymentType");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePaymentType(id);
      if (result?.error) {
        setError(result.error);
        setConfirm(false);
      }
    });
  }

  if (error) {
    return (
      <span className="text-xs text-red-600 dark:text-red-400 max-w-xs" title={error}>
        ⚠ {error.slice(0, 60)}…{" "}
        <button onClick={() => setError(null)} className="underline hover:text-red-800 dark:hover:text-red-300">
          {t("ok")}
        </button>
      </span>
    );
  }

  if (confirm) {
    return (
      <span className="flex items-center gap-1 text-sm">
        <span className="text-gray-600 dark:text-gray-400">{t("confirm", { name })}</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          aria-busy={isPending}
          className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-60 font-medium"
        >
          {isPending && <Spinner className="h-3.5 w-3.5" />}
          {t("yes")}
        </button>
        <button
          onClick={() => setConfirm(false)}
          disabled={isPending}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-60"
        >
          {t("no")}
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
    >
      {t("delete")}
    </button>
  );
}
