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
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("payment_types").insert({
    user_id: user.id,
    name: parsed.data.name,
    is_system: false,
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
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("payment_types")
    .update({ name: parsed.data.name })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("is_system", false);

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
