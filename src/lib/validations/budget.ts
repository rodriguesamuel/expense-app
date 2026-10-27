import { z } from "zod";

export function createBudgetSchema(t: (key: string) => string) {
  return z.object({
    category_id: z.string().uuid(t("categoryRequired")),
    month: z.string().regex(/^\d{4}-\d{2}$/, t("monthRequired")),
    amount: z.string().refine((value) => Number(value) > 0, t("amountPositive")),
  });
}
