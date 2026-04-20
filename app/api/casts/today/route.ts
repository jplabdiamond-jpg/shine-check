import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

function getTodayJst(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  if (jst.getUTCHours() < 3) jst.setUTCDate(jst.getUTCDate() - 1);
  return jst.toISOString().split("T")[0];
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  const today = getTodayJst();

  try {
    // キャストごとの本日売上・バック計算 + 出勤時間取得
    const castSales = await sql`
      SELECT
        c.id,
        c.name,
        c.stage_name,
        c.drink_back_rate,
        c.shimei_back_rate,
        c.douhan_back_rate,
        c.extension_back_rate,
        c.hourly_wage,
        c.today_checkin_at,
        c.today_checkout_at,
        COALESCE(SUM(CASE WHEN si.item_type = 'product'   THEN si.subtotal ELSE 0 END), 0) AS drink_total,
        COALESCE(SUM(CASE WHEN si.item_type = 'shimei'    THEN si.subtotal ELSE 0 END), 0) AS shimei_total,
        COALESCE(SUM(CASE WHEN si.item_type = 'douhan'    THEN si.subtotal ELSE 0 END), 0) AS douhan_total,
        COALESCE(SUM(CASE WHEN si.item_type = 'extension' THEN si.subtotal ELSE 0 END), 0) AS extension_total,
        COUNT(DISTINCT si.slip_id) AS slip_count
      FROM casts c
      LEFT JOIN slip_items si ON si.cast_id = c.id
        AND si.slip_id IN (
          SELECT id FROM slips
          WHERE store_id = ${storeId}
            AND business_date = ${today}
        )
      WHERE c.store_id = ${storeId} AND c.is_active = true
      GROUP BY c.id, c.name, c.stage_name,
               c.drink_back_rate, c.shimei_back_rate, c.douhan_back_rate, c.extension_back_rate,
               c.hourly_wage, c.today_checkin_at, c.today_checkout_at
      ORDER BY c.name
    `;

    return NextResponse.json({ castSales, today });
  } catch (err) {
    console.error("[CastsToday GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
