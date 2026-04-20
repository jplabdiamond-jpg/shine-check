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
    const [dailySales, topProducts, slips] = await Promise.all([
      sql`SELECT * FROM daily_sales WHERE store_id = ${storeId} ORDER BY business_date DESC LIMIT ${days}`,
      sql`
        SELECT si.product_name, SUM(si.quantity) as total_qty, SUM(si.subtotal) as total_revenue
        FROM slip_items si JOIN slips s ON s.id = si.slip_id
        WHERE s.store_id = ${storeId} AND s.business_date >= CURRENT_DATE - (${days} * INTERVAL '1 day')
        GROUP BY si.product_name ORDER BY total_revenue DESC LIMIT 10
      `,
      sql`SELECT * FROM slips WHERE store_id = ${storeId} AND business_date >= CURRENT_DATE - (${days} * INTERVAL '1 day') AND status IN ('closed','locked')`,
    ]);
    return NextResponse.json({ dailySales, topProducts, slips });
  } catch (err) {
    console.error("[Analytics GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
