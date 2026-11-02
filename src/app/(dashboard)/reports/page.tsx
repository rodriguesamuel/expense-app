import { getI18n } from "@/lib/i18n.server";
import { ReportsClient } from "@/components/reports/reports-client";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = { title: "Reports — Expense Tracker" };

export default async function ReportsPage() {
  const { t } = await getI18n("reports");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("title")}</h1>
      <ReportsClient />
    </div>
  );
}
