import { z } from "zod";

export const expenseSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
      message: "Amount must be a positive number",
    }),
  payment_type_id: z.string().uuid("Please select a payment type"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(1000).optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
