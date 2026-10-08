"use client";

import { useTranslations } from "next-intl";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">{t("somethingWentWrong")}</p>
        <p className="text-sm text-gray-500 mt-1">{error.message}</p>
      </div>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        {t("tryAgain")}
      </button>
    </div>
  );
}
