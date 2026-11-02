"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createExpenseSchema } from "@/lib/validations/expense";
import { getI18n } from "@/lib/i18n.server";
import { calculatePaymentDates, splitInstallmentAmounts } from "@/lib/utils";
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
    installment_count: formData.get("installment_count") as string || "1",
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { data: paymentType, error: paymentTypeError } = await supabase
    .from("payment_types")
    .select("type, cutoff_day, due_day")
    .eq("id", parsed.data.payment_type_id)
    .eq("user_id", user.id)
    .single();
  if (paymentTypeError || !paymentType) return { error: paymentTypeError?.message ?? "Payment type not found" };

  const installmentCount = paymentType.type === "credit_card"
    ? Number(parsed.data.installment_count)
    : 1;
  if (paymentType.type === "credit_card" && (!paymentType.cutoff_day || !paymentType.due_day)) {
    return { error: "Credit card payment type is not configured" };
  }
  const amounts = splitInstallmentAmounts(parseFloat(parsed.data.amount), installmentCount);
  const paymentDates = paymentType.type === "credit_card"
    ? calculatePaymentDates(parsed.data.date, paymentType.cutoff_day!, paymentType.due_day!, installmentCount)
    : [parsed.data.date];

  const { error } = await supabase.rpc("create_expense_installments", {
    p_user_id: user.id,
    p_description: parsed.data.description,
    p_total_amount: parseFloat(parsed.data.amount),
    p_payment_type_id: parsed.data.payment_type_id,
    p_category_id: parsed.data.category_id || null,
    p_purchase_date: parsed.data.date,
    p_notes: parsed.data.notes || null,
    p_payment_dates: paymentDates,
    p_amounts: amounts,
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
    installment_count: formData.get("installment_count") as string || "1",
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const [{ data: existing }, { data: paymentType, error: paymentTypeError }] = await Promise.all([
    supabase.from("expenses").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("payment_types").select("type, cutoff_day, due_day").eq("id", parsed.data.payment_type_id).eq("user_id", user.id).single(),
  ]);
  if (!existing) return { error: "Expense not found" };
  if (paymentTypeError || !paymentType) return { error: paymentTypeError?.message ?? "Payment type not found" };

  const installmentCount = paymentType.type === "credit_card" ? Number(parsed.data.installment_count) : 1;
  if (paymentType.type === "credit_card" && (!paymentType.cutoff_day || !paymentType.due_day)) {
    return { error: "Credit card payment type is not configured" };
  }
  const amounts = splitInstallmentAmounts(parseFloat(parsed.data.amount), installmentCount);
  const paymentDates = paymentType.type === "credit_card"
    ? calculatePaymentDates(parsed.data.date, paymentType.cutoff_day!, paymentType.due_day!, installmentCount)
    : [parsed.data.date];

  let error;
  if (existing.installment_group_id) {
    ({ error } = await supabase.rpc("replace_expense_installments", {
      p_user_id: user.id,
      p_group_id: existing.installment_group_id,
      p_description: parsed.data.description,
      p_payment_type_id: parsed.data.payment_type_id,
      p_category_id: parsed.data.category_id || null,
      p_purchase_date: parsed.data.date,
      p_notes: parsed.data.notes || null,
      p_payment_dates: paymentDates,
      p_amounts: amounts,
    }));
  } else {
    ({ error } = await supabase
      .from("expenses")
      .update({
        description: parsed.data.description,
        amount: amounts[0],
        payment_type_id: parsed.data.payment_type_id,
        category_id: parsed.data.category_id || null,
        date: parsed.data.date,
        payment_date: paymentDates[0],
        notes: parsed.data.notes || null,
        installment_number: null,
        installment_count: null,
      })
      .eq("id", id)
      .eq("user_id", user.id));
  }

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

  const { error } = await supabase.rpc("delete_expense_series", {
    p_user_id: user.id,
    p_expense_id: id,
  });

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
    .gte("payment_date", dateFrom)
    .lte("payment_date", dateTo)
    .order("payment_date", { ascending: false })
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
