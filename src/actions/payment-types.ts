"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createPaymentTypeSchema } from "@/lib/validations/payment-type";
import { getI18n } from "@/lib/i18n.server";
import type { ActionResult } from "@/types";

export async function createPaymentType(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { t: tv } = await getI18n("validation");
  const { t: ta } = await getI18n("actions");
  const paymentTypeSchema = createPaymentTypeSchema(tv);

  const parsed = paymentTypeSchema.safeParse({
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    cutoff_day: formData.get("cutoff_day") || undefined,
    due_day: formData.get("due_day") || undefined,
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("payment_types").insert({
    user_id: user.id,
    name: parsed.data.name,
    is_system: false,
    type: parsed.data.type,
    cutoff_day: parsed.data.cutoff_day ?? null,
    due_day: parsed.data.due_day ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: ta("duplicatePaymentType") };
    }
    return { error: error.message };
  }

  revalidatePath("/payment-types");
  return {};
}

export async function updatePaymentType(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { t: tv } = await getI18n("validation");
  const { t: ta } = await getI18n("actions");
  const paymentTypeSchema = createPaymentTypeSchema(tv);

  const parsed = paymentTypeSchema.safeParse({
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    cutoff_day: formData.get("cutoff_day") || undefined,
    due_day: formData.get("due_day") || undefined,
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("payment_types")
    .update({
      name: parsed.data.name,
      type: parsed.data.type,
      cutoff_day: parsed.data.cutoff_day ?? null,
      due_day: parsed.data.due_day ?? null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: ta("duplicatePaymentType") };
    }
    return { error: error.message };
  }

  revalidatePath("/payment-types");
  return {};
}

export async function deletePaymentType(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { t: ta } = await getI18n("actions");

  const { count } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("payment_type_id", id)
    .eq("user_id", user.id);

  if (count && count > 0) {
    return {
      error: ta("deleteBlocked", { count }),
    };
  }

  const { error } = await supabase
    .from("payment_types")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("is_system", false);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/payment-types");
  return {};
}
