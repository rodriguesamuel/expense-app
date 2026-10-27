"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCategorySchema } from "@/lib/validations/category";
import { getI18n } from "@/lib/i18n.server";
import type { ActionResult } from "@/types";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await getUser();
  const { t: tv } = await getI18n("validation");
  const { t: ta } = await getI18n("actions");
  const parsed = createCategorySchema(tv).safeParse({ name: formData.get("name") as string });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const { error } = await supabase.from("categories").insert({ user_id: user.id, name: parsed.data.name });
  if (error) return { error: error.code === "23505" ? ta("duplicateCategory") : error.message };
  revalidatePath("/categories");
  return {};
}

export async function updateCategory(id: string, formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await getUser();
  const { t: tv } = await getI18n("validation");
  const { t: ta } = await getI18n("actions");
  const parsed = createCategorySchema(tv).safeParse({ name: formData.get("name") as string });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const { error } = await supabase.from("categories").update({ name: parsed.data.name }).eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.code === "23505" ? ta("duplicateCategory") : error.message };
  revalidatePath("/categories");
  revalidatePath("/budgets");
  return {};
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase, user } = await getUser();
  const { error } = await supabase.from("categories").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/categories");
  revalidatePath("/expenses");
  revalidatePath("/reports");
  return {};
}
