"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface Props {
  className?: string;
}

export function LoadingState({ className }: Props) {
  const t = useTranslations("common");

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16 text-sm text-gray-400 dark:text-gray-500",
        className
      )}
    >
      <Spinner className="h-8 w-8 text-blue-600 dark:text-blue-400" />
      <span>{t("loading")}</span>
    </div>
  );
}
