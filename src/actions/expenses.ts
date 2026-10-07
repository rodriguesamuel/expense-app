"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { expenseSchema } from "@/lib/validations/expense";
import type { ActionResult } from "@/types";

export async function createExpense(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    payment_type_id: formData.get("payment_type_id") as string,
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

  const raw = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    payment_type_id: formData.get("payment_type_id") as string,
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
