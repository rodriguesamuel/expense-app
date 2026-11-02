export const dynamic = "force-dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BudgetManager } from "@/components/budgets/budget-manager";
import { monthStartISO } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<{ month?: string }>;
};

export default async function BudgetsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  const requestedMonth = params.month;
  const month = requestedMonth && /^\d{4}-\d{2}$/.test(requestedMonth)
    ? requestedMonth
    : monthStartISO().slice(0, 7);
  const [{ data: categories }, { data: budgets }] = await Promise.all([
    supabase.from("categories").select("*").eq("user_id", user.id).order("name"),
    supabase.from("budgets").select("*").eq("user_id", user.id).eq("month", `${month}-01`).order("created_at"),
  ]);
  return <BudgetManager categories={categories ?? []} budgets={budgets ?? []} month={month} />;
}
