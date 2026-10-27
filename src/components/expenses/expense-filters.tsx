"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { monthStartISO, monthEndISO } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import type { PaymentType } from "@/types";

interface Props {
  paymentTypes: PaymentType[];
}

export function ExpenseFilters({ paymentTypes }: Props) {
  const t = useTranslations("filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 items-end" aria-busy={isPending}>
      <div className="col-span-1 min-w-0">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t("from")}</label>
        <input
          type="date"
          defaultValue={searchParams.get("date_from") ?? monthStartISO()}
          onChange={(e) => update("date_from", e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="col-span-1 min-w-0">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t("to")}</label>
        <input
          type="date"
          defaultValue={searchParams.get("date_to") ?? monthEndISO()}
          onChange={(e) => update("date_to", e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="col-span-2 sm:col-span-1 sm:w-48 min-w-0">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{t("paymentType")}</label>
        <select
          defaultValue={searchParams.get("payment_type_id") ?? ""}
          onChange={(e) => update("payment_type_id", e.target.value)}
          className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">{t("allTypes")}</option>
          {paymentTypes.map((pt) => (
            <option key={pt.id} value={pt.id} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              {pt.name}
            </option>
          ))}
        </select>
      </div>
      {isPending && (
        <div className="col-span-2 sm:col-span-1 flex items-center h-[34px] text-blue-600 dark:text-blue-400">
          <Spinner className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
