import { z } from "zod";

export function createExpenseSchema(t: (key: string) => string) {
  return z.object({
    description: z.string().min(1, t("descriptionRequired")).max(500),
    amount: z
      .string()
      .min(1, t("amountRequired"))
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
        message: t("amountPositive"),
      }),
    payment_type_id: z.string().uuid(t("paymentTypeRequired")),
    category_id: z.string().uuid(t("categoryRequired")).optional().or(z.literal("")),
    date: z.string().min(1, t("dateRequired")),
    notes: z.string().max(1000).optional(),
  });
}

export type ExpenseFormValues = {
  description: string;
  amount: string;
  payment_type_id: string;
  date: string;
  notes?: string;
};
