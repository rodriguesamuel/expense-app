"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CategoryForm } from "./category-form";
import { DeleteCategoryBtn } from "./delete-category-btn";
import type { Category } from "@/types";

export function CategoryList({ categories }: { categories: Category[] }) {
  const t = useTranslations("categories");
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <button onClick={() => setCreating(true)} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">{t("addCategory")}</button>
      </div>
      {creating && <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900/50 rounded-xl p-6"><h2 className="font-semibold mb-4">{t("newCategory")}</h2><CategoryForm onDone={() => setCreating(false)} /></div>}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60"><tr><th className="text-left px-4 sm:px-6 py-3 font-medium text-gray-500">{t("nameHeader")}</th><th className="px-4 sm:px-6 py-3" /></tr></thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {categories.map((category) => <tr key={category.id}>
              <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 dark:text-white">{editing === category.id ? <CategoryForm existing={category} onDone={() => setEditing(null)} /> : category.name}</td>
              <td className="px-4 sm:px-6 py-4"><div className="flex gap-3 justify-end">{editing !== category.id && <><button onClick={() => setEditing(category.id)} className="text-sm text-blue-600">{t("edit")}</button><DeleteCategoryBtn id={category.id} name={category.name} /></>}</div></td>
            </tr>)}
            {categories.length === 0 && <tr><td colSpan={2} className="px-6 py-8 text-center text-gray-500">{t("empty")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
