"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deletePaymentType } from "@/actions/payment-types";

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
      <span className="text-xs text-red-600 max-w-xs" title={error}>
        ⚠ {error.slice(0, 60)}…{" "}
        <button onClick={() => setError(null)} className="underline">
          {t("ok")}
        </button>
      </span>
    );
  }

  if (confirm) {
    return (
      <span className="flex items-center gap-1 text-sm">
        <span className="text-gray-600">{t("confirm", { name })}</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-red-600 hover:text-red-800 font-medium"
        >
          {isPending ? "…" : t("yes")}
        </button>
        <button onClick={() => setConfirm(false)} className="text-gray-500 hover:text-gray-700">
          {t("no")}
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
