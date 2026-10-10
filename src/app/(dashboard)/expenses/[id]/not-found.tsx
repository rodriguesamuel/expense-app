"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ExpenseNotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <p className="text-lg font-semibold text-gray-900 dark:text-white">{t("notFound")}</p>
      <Link href="/expenses" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        {t("backToExpenses")}
      </Link>
    </div>
  );
}
