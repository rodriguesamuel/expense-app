"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteExpense } from "@/actions/expenses";

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
          className="text-red-600 hover:text-red-800 font-medium"
        >
          {isPending ? "…" : t("delete")}
        </button>
        <button onClick={() => setConfirm(false)} className="text-gray-500">
          {t("cancel")}
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="text-sm text-red-500 hover:text-red-700"
    >
      {t("delete")}
    </button>
  );
}
