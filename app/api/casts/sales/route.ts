import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  const { searchParams } = new URL(req.url);
  const days = Number(searchParams.get("days") ?? 30);

  try {
    // cast_id が紐付いた slip_items から集計
    const castSales = await sql`
      SELECT
        c.id,
        c.name,
        c.stage_name,
        c.drink_back_rate,
        c.shimei_back_rate,
        c.douhan_back_rate,
        c.extension_back_rate,
        COALESCE(SUM(CASE WHEN si.item_type = 'product' THEN si.subtotal ELSE 0 END), 0) AS drink_total,
        COALESCE(SUM(CASE WHEN si.item_type = 'shimei'  THEN si.subtotal ELSE 0 END), 0) AS shimei_total,
        COALESCE(SUM(CASE WHEN si.item_type = 'douhan'  THEN si.subtotal ELSE 0 END), 0) AS douhan_total,
        COALESCE(SUM(CASE WHEN si.item_type = 'extension' THEN si.subtotal ELSE 0 END), 0) AS extension_total,
        COUNT(DISTINCT si.slip_id) AS slip_count
      FROM casts c
      LEFT JOIN slip_items si ON si.cast_id = c.id
        AND si.slip_id IN (
          SELECT id FROM slips
          WHERE store_id = ${storeId}
            AND business_date >= CURRENT_DATE - (${days} * INTERVAL '1 day')
            AND status IN ('closed','locked')
        )
      WHERE c.store_id = ${storeId} AND c.is_active = true
      GROUP BY c.id, c.name, c.stage_name, c.drink_back_rate, c.shimei_back_rate, c.douhan_back_rate, c.extension_back_rate
      ORDER BY drink_total DESC
    `;
    return NextResponse.json({ castSales });
  } catch (err) {
    console.error("[CastSales GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
