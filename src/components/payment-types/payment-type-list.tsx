"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PaymentTypeForm } from "./payment-type-form";
import { DeletePaymentTypeBtn } from "./delete-payment-type-btn";
import type { PaymentType } from "@/types";

interface Props {
  paymentTypes: PaymentType[];
}

export function PaymentTypeList({ paymentTypes }: Props) {
  const t = useTranslations("paymentTypes");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          {t("addType")}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900/50 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">{t("newType")}</h2>
          <PaymentTypeForm onDone={() => setShowCreate(false)} />
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[320px]">
            <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="text-left px-4 sm:px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("nameHeader")}</th>
                <th className="text-left px-4 sm:px-6 py-3 font-medium text-gray-500 dark:text-gray-400">{t("typeHeader")}</th>
                <th className="px-4 sm:px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {paymentTypes.map((pt) => (
                <tr key={pt.id}>
                  <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {editingId === pt.id ? (
                      <PaymentTypeForm
                        existing={pt}
                        onDone={() => setEditingId(null)}
                      />
                    ) : (
                      pt.name
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    {pt.is_system ? (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                        {t("default")}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                        {t("custom")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    {editingId !== pt.id && (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditingId(pt.id)}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          {t("edit")}
                        </button>
                        {!pt.is_system && <DeletePaymentTypeBtn id={pt.id} name={pt.name} />}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
