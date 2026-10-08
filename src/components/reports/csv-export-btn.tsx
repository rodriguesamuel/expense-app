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
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg flex items-center gap-2"
    >
      {t("exportCsv")}
    </button>
  );
}
