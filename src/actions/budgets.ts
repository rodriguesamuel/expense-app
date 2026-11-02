"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBudgetSchema } from "@/lib/validations/budget";
import { getI18n } from "@/lib/i18n.server";
import { addMonthsISO } from "@/lib/utils";
import type { ActionResult } from "@/types";

export async function saveBudget(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { t: tv } = await getI18n("validation");
  const parsed = createBudgetSchema(tv).safeParse({
    category_id: formData.get("category_id"),
    month: formData.get("month"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const month = `${parsed.data.month}-01`;
  const { error } = await supabase.from("budgets").upsert({
    user_id: user.id,
    category_id: parsed.data.category_id,
    month,
    amount: Number(parsed.data.amount),
  }, { onConflict: "category_id,month" });
  if (error) return { error: error.message };
  revalidatePath("/budgets");
  revalidatePath("/reports");
  return {};
}

export async function deleteBudget(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.from("budgets").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/budgets");
  revalidatePath("/reports");
  return {};
}

export async function copyPreviousMonthBudgets(monthValue: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!/^\d{4}-\d{2}$/.test(monthValue)) {
    return { error: "Invalid month" };
  }

  const targetMonth = `${monthValue}-01`;
  const sourceMonth = addMonthsISO(targetMonth, -1, 1);
  const { data: previousBudgets, error: fetchError } = await supabase
    .from("budgets")
    .select("category_id,amount")
    .eq("user_id", user.id)
    .eq("month", sourceMonth);

  if (fetchError) return { error: fetchError.message };
  if (!previousBudgets?.length) return { error: "No budgets found for the previous month" };

  const { error: upsertError } = await supabase.from("budgets").upsert(
    previousBudgets.map((budget) => ({
      user_id: user.id,
      category_id: budget.category_id,
      month: targetMonth,
      amount: budget.amount,
    })),
    { onConflict: "category_id,month" }
  );

  if (upsertError) return { error: upsertError.message };
  revalidatePath("/budgets");
  revalidatePath("/reports");
  return {};
}
