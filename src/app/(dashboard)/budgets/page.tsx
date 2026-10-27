export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BudgetManager } from "@/components/budgets/budget-manager";
import { monthStartISO } from "@/lib/utils";

export default async function BudgetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const month = monthStartISO().slice(0, 7);
  const [{ data: categories }, { data: budgets }] = await Promise.all([
    supabase.from("categories").select("*").eq("user_id", user.id).order("name"),
    supabase.from("budgets").select("*").eq("user_id", user.id).eq("month", `${month}-01`).order("created_at"),
  ]);
  return <BudgetManager categories={categories ?? []} budgets={budgets ?? []} month={month} />;
}
