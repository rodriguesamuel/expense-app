"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createExpenseSchema } from "@/lib/validations/expense";
import { getI18n } from "@/lib/i18n.server";
import type { ActionResult, ExpenseWithPaymentType } from "@/types";

export async function createExpense(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { t } = await getI18n("validation");
  const expenseSchema = createExpenseSchema(t);

  const raw = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    payment_type_id: formData.get("payment_type_id") as string,
    category_id: (formData.get("category_id") as string) || undefined,
    date: formData.get("date") as string,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    description: parsed.data.description,
    amount: parseFloat(parsed.data.amount),
    payment_type_id: parsed.data.payment_type_id,
    category_id: parsed.data.category_id || null,
    date: parsed.data.date,
    notes: parsed.data.notes || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  redirect("/expenses");
}

export async function updateExpense(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { t } = await getI18n("validation");
  const expenseSchema = createExpenseSchema(t);

  const raw = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    payment_type_id: formData.get("payment_type_id") as string,
    category_id: (formData.get("category_id") as string) || undefined,
    date: formData.get("date") as string,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("expenses")
    .update({
      description: parsed.data.description,
      amount: parseFloat(parsed.data.amount),
      payment_type_id: parsed.data.payment_type_id,
      category_id: parsed.data.category_id || null,
      date: parsed.data.date,
      notes: parsed.data.notes || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  redirect("/expenses");
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  return {};
}

export async function getExpenses({
  dateFrom,
  dateTo,
  paymentTypeId,
  categoryId,
  page = 1,
  perPage = 25,
}: {
  dateFrom: string;
  dateTo: string;
  paymentTypeId?: string;
  categoryId?: string;
  page?: number;
  perPage?: number;
}): Promise<{ expenses: ExpenseWithPaymentType[]; count: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("expenses_with_payment_type")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, to);

  if (paymentTypeId) {
    query = query.eq("payment_type_id", paymentTypeId);
  }

  if (categoryId === "none") {
    query = query.is("category_id", null);
  } else if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, count, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return {
    expenses: (data as ExpenseWithPaymentType[]) ?? [],
    count: count ?? 0,
  };
}
