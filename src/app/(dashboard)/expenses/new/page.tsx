export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getI18n } from "@/lib/i18n.server";
import { ExpenseForm } from "@/components/expenses/expense-form";

export const metadata = { title: "New Expense — Expense Tracker" };

export default async function NewExpensePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { t } = await getI18n("common");

  const [{ data: paymentTypes }, { data: categories }] = await Promise.all([
    supabase
    .from("payment_types")
    .select("*")
    .eq("user_id", user.id)
    .order("name"),
    supabase.from("categories").select("*").eq("user_id", user.id).order("name"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("newExpense")}</h1>
      <ExpenseForm paymentTypes={paymentTypes ?? []} categories={categories ?? []} />
    </div>
  );
}
