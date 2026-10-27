export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getI18n } from "@/lib/i18n.server";
import { ExpenseForm } from "@/components/expenses/expense-form";

export const metadata = { title: "Edit Expense — Expense Tracker" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExpensePage({ params }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { t } = await getI18n("common");
  const { id } = await params;

  const [{ data: expense }, { data: paymentTypes }, { data: categories }] = await Promise.all([
    supabase
      .from("expenses_with_payment_type")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("payment_types")
      .select("*")
      .eq("user_id", user.id)
      .order("name"),
    supabase.from("categories").select("*").eq("user_id", user.id).order("name"),
  ]);

  if (!expense) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("editExpense")}</h1>
      <ExpenseForm paymentTypes={paymentTypes ?? []} categories={categories ?? []} existing={expense} />
    </div>
  );
}
