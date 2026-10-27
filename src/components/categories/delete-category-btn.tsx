"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteCategory } from "@/actions/categories";

export function DeleteCategoryBtn({ id, name }: { id: string; name: string }) {
  const t = useTranslations("deleteCategory");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function remove() {
    if (!window.confirm(t("confirm", { name }))) return;
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (result.error) setError(result.error);
    });
  }
  return <>{error ? <span className="text-xs text-red-600">{error}</span> : <button disabled={pending} onClick={remove} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 disabled:opacity-50">{t("delete")}</button>}</>;
}
