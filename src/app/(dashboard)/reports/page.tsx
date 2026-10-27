import { getI18n } from "@/lib/i18n.server";
import { ReportsClient } from "@/components/reports/reports-client";
import { CategoryBudgetReport } from "@/components/reports/category-budget-report";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { monthStartISO, monthEndISO } from "@/lib/utils";

export const metadata = { title: "Reports — Expense Tracker" };

export default async function ReportsPage() {
  const { t } = await getI18n("reports");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const from = monthStartISO();
  const to = monthEndISO();
  const [{ data: categories }, { data: expenses }, { data: budgets }] = await Promise.all([
    supabase.from("categories").select("id,name").eq("user_id", user.id).order("name"),
    supabase.from("expenses").select("category_id,amount").eq("user_id", user.id).gte("date", from).lte("date", to),
    supabase.from("budgets").select("category_id,amount").eq("user_id", user.id).eq("month", from),
  ]);
  const rows = (categories ?? []).map((category) => {
    const spent = (expenses ?? []).filter((expense) => expense.category_id === category.id).reduce((sum, expense) => sum + Number(expense.amount), 0);
    const budget = Number((budgets ?? []).find((item) => item.category_id === category.id)?.amount ?? 0);
    return { categoryId: category.id, categoryName: category.name, spent, budget, difference: budget - spent, percentage: budget ? spent / budget * 100 : 0 };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
      <CategoryBudgetReport rows={rows} />
      <ReportsClient />
    </div>
  );
}
