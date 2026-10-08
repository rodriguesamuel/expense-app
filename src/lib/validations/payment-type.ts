import { z } from "zod";

export function createPaymentTypeSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t("nameRequired")).max(100),
  });
}

export type PaymentTypeFormValues = {
  name: string;
};
