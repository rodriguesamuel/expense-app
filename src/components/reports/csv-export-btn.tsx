"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  dateFrom: string;
  dateTo: string;
}

export function CsvExportBtn({ dateFrom, dateTo }: Props) {
  const t = useTranslations("reports");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filename =
        /filename="?([^";]+)"?/.exec(disposition)?.[1] ?? `expenses_${dateFrom}_${dateTo}.csv`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError(t("exportFailed"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleDownload}
        disabled={isPending}
        aria-busy={isPending}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 rounded-lg flex items-center gap-2 transition-colors"
      >
        {isPending && <Spinner />}
        {isPending ? t("exporting") : t("exportCsv")}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
