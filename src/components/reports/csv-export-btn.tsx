"use client";

import { useTranslations } from "next-intl";

interface Props {
  dateFrom: string;
  dateTo: string;
}

export function CsvExportBtn({ dateFrom, dateTo }: Props) {
  const t = useTranslations("reports");

  function handleDownload() {
    const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    window.location.href = `/api/reports/export?${params.toString()}`;
  }

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors"
    >
      {t("exportCsv")}
    </button>
  );
}
