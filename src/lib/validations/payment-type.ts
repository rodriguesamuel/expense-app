import { z } from "zod";

export function createPaymentTypeSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t("nameRequired")).max(100),
    type: z.enum(["other", "credit_card"]),
    cutoff_day: z.coerce.number().int().min(1).max(31).optional(),
    due_day: z.coerce.number().int().min(1).max(31).optional(),
  }).superRefine((value, ctx) => {
    if (value.type === "credit_card" && value.cutoff_day === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["cutoff_day"], message: t("cutoffDayRequired") });
    }
    if (value.type === "credit_card" && value.due_day === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["due_day"], message: t("dueDayRequired") });
    }
  });
}

export type PaymentTypeFormValues = {
  name: string;
  type: "other" | "credit_card";
  cutoff_day?: number;
  due_day?: number;
};
