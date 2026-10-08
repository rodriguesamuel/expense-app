import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ReportSummary } from "@/types";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "date_from and date_to are required" }, { status: 400 });
  }

  const { data: expenses, error } = await supabase
    .from("expenses_with_payment_type")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", dateFrom)
    .lte("date", dateTo);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = expenses ?? [];
  const total = rows.reduce((s, e) => s + Number(e.amount), 0);
  const count = rows.length;

  const days = Math.max(
    1,
    Math.ceil(
      (new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000
    ) + 1
  );
  const dailyAverage = count > 0 ? total / days : 0;

  // Group by payment type
  const ptMap: Record<string, { paymentTypeId: string; paymentTypeName: string; total: number; count: number }> = {};
  for (const e of rows) {
    if (!ptMap[e.payment_type_id]) {
      ptMap[e.payment_type_id] = {
        paymentTypeId: e.payment_type_id,
        paymentTypeName: e.payment_type_name,
        total: 0,
        count: 0,
      };
    }
    ptMap[e.payment_type_id].total += Number(e.amount);
    ptMap[e.payment_type_id].count += 1;
  }
  const byPaymentType = Object.values(ptMap)
    .sort((a, b) => b.total - a.total)
    .map((pt) => ({
      ...pt,
      total: Number(pt.total.toFixed(2)),
      percentage: total > 0 ? Number(((pt.total / total) * 100).toFixed(1)) : 0,
    }));

  // Group by month
  const monthMap: Record<string, { total: number; count: number }> = {};
  for (const e of rows) {
    const month = e.date.slice(0, 7);
    if (!monthMap[month]) monthMap[month] = { total: 0, count: 0 };
    monthMap[month].total += Number(e.amount);
    monthMap[month].count += 1;
  }
  const byMonth = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({ month, total: Number(d.total.toFixed(2)), count: d.count }));

  const summary: ReportSummary = {
    period: { from: dateFrom, to: dateTo },
    total: Number(total.toFixed(2)),
    count,
    dailyAverage: Number(dailyAverage.toFixed(2)),
    byPaymentType,
    byMonth,
  };

  return NextResponse.json(summary);
}
