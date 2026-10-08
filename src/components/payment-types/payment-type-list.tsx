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
        <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          {t("addType")}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white border border-blue-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t("newType")}</h2>
          <PaymentTypeForm onDone={() => setShowCreate(false)} />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">{t("nameHeader")}</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">{t("typeHeader")}</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paymentTypes.map((pt) => (
              <tr key={pt.id}>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {editingId === pt.id ? (
                    <PaymentTypeForm
                      existing={pt}
                      onDone={() => setEditingId(null)}
                    />
                  ) : (
                    pt.name
                  )}
                </td>
                <td className="px-6 py-4">
                  {pt.is_system ? (
                    <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {t("default")}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                      {t("custom")}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {!pt.is_system && editingId !== pt.id && (
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(pt.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {t("edit")}
                      </button>
                      <DeletePaymentTypeBtn id={pt.id} name={pt.name} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
