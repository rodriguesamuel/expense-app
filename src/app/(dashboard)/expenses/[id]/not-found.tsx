"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LinkPendingIndicator } from "@/components/ui/link-pending-indicator";

export default function ExpenseNotFound() {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <p className="text-lg font-semibold text-gray-900 dark:text-white">{t("notFound")}</p>
      <Link href="/expenses" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
        <LinkPendingIndicator className="h-3.5 w-3.5" />
        {t("backToExpenses")}
      </Link>
    </div>
  );
}
