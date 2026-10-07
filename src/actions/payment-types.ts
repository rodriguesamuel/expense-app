"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { paymentTypeSchema } from "@/lib/validations/payment-type";
import type { ActionResult } from "@/types";

export async function createPaymentType(
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
      return { error: "A payment type with this name already exists." };
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
      return { error: "A payment type with this name already exists." };
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

  // Check if any expenses reference this payment type
  const { count } = await supabase
    .from("expenses")
    .select("id", { count: "exact", head: true })
    .eq("payment_type_id", id)
    .eq("user_id", user.id);

  if (count && count > 0) {
    return {
      error: `Cannot delete: ${count} expense${count > 1 ? "s" : ""} use this payment type. Reassign or delete them first.`,
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
