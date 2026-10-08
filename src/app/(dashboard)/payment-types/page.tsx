export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PaymentTypeList } from "@/components/payment-types/payment-type-list";

export const metadata = { title: "Payment Types — Expense Tracker" };

export default async function PaymentTypesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: paymentTypes } = await supabase
    .from("payment_types")
    .select("*")
    .eq("user_id", user.id)
    .order("is_system", { ascending: false })
    .order("name");

  return <PaymentTypeList paymentTypes={paymentTypes ?? []} />;
}
