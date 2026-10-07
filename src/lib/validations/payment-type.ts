import { z } from "zod";

export const paymentTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export type PaymentTypeFormValues = z.infer<typeof paymentTypeSchema>;
