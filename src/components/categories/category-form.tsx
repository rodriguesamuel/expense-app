"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { createCategory, updateCategory } from "@/actions/categories";
import type { Category } from "@/types";

export function CategoryForm({ existing, onDone }: { existing?: Category; onDone: () => void }) {
  const t = useTranslations("categoryForm");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = existing ? await updateCategory(existing.id, data) : await createCategory(data);
      if (result.error) setError(result.error);
      else onDone();
    });
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("nameLabel")}</label>
        <input id="category-name" name="name" type="text" defaultValue={existing?.name ?? ""} required maxLength={100}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={t("namePlaceholder")} />
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onDone} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg">{t("cancel")}</button>
        <button type="submit" disabled={pending} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg">{pending ? t("saving") : existing ? t("update") : t("create")}</button>
      </div>
    </form>
  );
}
