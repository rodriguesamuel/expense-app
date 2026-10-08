import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const dateFrom = searchParams.get("date_from");
  const dateTo = searchParams.get("date_to");
  const paymentTypeId = searchParams.get("payment_type_id");

  if (!dateFrom || !dateTo) {
    return NextResponse.json({ error: "date_from and date_to are required" }, { status: 400 });
  }

  let query = supabase
    .from("expenses_with_payment_type")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", dateFrom)
    .lte("date", dateTo)
    .order("date", { ascending: false });

  if (paymentTypeId) {
    query = query.eq("payment_type_id", paymentTypeId);
  }

  const { data: expenses, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = expenses ?? [];

  const csvHeader = "Date,Description,Amount,Payment Type,Notes";
  const csvRows = rows.map((e) => {
    const desc = `"${(e.description ?? "").replace(/"/g, '""')}"`;
    const notes = `"${(e.notes ?? "").replace(/"/g, '""')}"`;
    const amount = Number(e.amount).toFixed(2);
    return `${e.date},${desc},${amount},${e.payment_type_name},${notes}`;
  });

  const csv = [csvHeader, ...csvRows].join("\r\n");
  const filename = `expenses_${dateFrom}_${dateTo}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
