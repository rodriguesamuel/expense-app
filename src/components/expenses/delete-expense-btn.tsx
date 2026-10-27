"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteExpense } from "@/actions/expenses";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  id: string;
}

export function DeleteExpenseBtn({ id }: Props) {
  const t = useTranslations("deleteExpense");
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteExpense(id);
    });
  }

  if (confirm) {
    return (
      <span className="flex items-center gap-1 text-sm">
        <button
          onClick={handleDelete}
          disabled={isPending}
          aria-busy={isPending}
          className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 disabled:opacity-60 font-medium"
        >
          {isPending && <Spinner className="h-3.5 w-3.5" />}
          {t("delete")}
        </button>
        <button
          onClick={() => setConfirm(false)}
          disabled={isPending}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-60"
        >
          {t("cancel")}
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
