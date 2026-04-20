import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

function getTodayJst(): string {
  // AM3:00基準の営業日（0:00〜2:59は前日扱い）
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  if (jst.getUTCHours() < 3) jst.setUTCDate(jst.getUTCDate() - 1);
  return jst.toISOString().split("T")[0];
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;

  try {
    const today = getTodayJst();

    // 営業終了済みか確認
    const dailySales = await sql`
      SELECT is_closed FROM daily_sales
      WHERE store_id = ${storeId} AND business_date = ${today}::date
      LIMIT 1
    `;
    const isClosed = dailySales[0]?.is_closed === true;

    // 営業終了済みの場合は空データを返す（ダッシュボードを¥0表示に保つ）
    if (isClosed) {
      const tables = await sql`SELECT * FROM tables WHERE store_id = ${storeId} AND is_active = true ORDER BY sort_order`;
      return NextResponse.json({ slips: [], tables, isClosed: true });
    }

    const [slips, tables] = await Promise.all([
      sql`SELECT * FROM slips WHERE store_id = ${storeId} AND business_date = ${today}::date ORDER BY created_at DESC`,
      sql`SELECT * FROM tables WHERE store_id = ${storeId} AND is_active = true ORDER BY sort_order`,
    ]);
    return NextResponse.json({ slips, tables, isClosed: false });
  } catch (err) {
    console.error("[Dashboard GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  const userId = session.user.id;

  try {
    const today = getTodayJst();

    // Step1: 営業中のopen伝票を全て自動会計（残高0でも記録）
    const openSlips = await sql`SELECT id, table_id FROM slips WHERE store_id = ${storeId} AND status = 'open' AND business_date = ${today}::date`;

    for (const slip of openSlips) {
      // サーバー側で合計を再計算（/api/slips/[id]のcloseと同じロジック）
      const storeRow = await sql`SELECT tax_rate, service_rate, tax_type, service_type FROM stores WHERE id = ${storeId}`;
      const s = storeRow[0];
      const itemsSum = await sql`SELECT COALESCE(SUM(subtotal),0) as total FROM slip_items WHERE slip_id = ${slip.id}`;
      const subtotal = Number(itemsSum[0].total);
      const taxRate = Number(s?.tax_rate ?? 0);
      const serviceRate = Number(s?.service_rate ?? 0);
      const taxType = s?.tax_type ?? "percent";
      const serviceType = s?.service_type ?? "percent";
      const taxAmount = taxType === "percent" ? Math.floor(subtotal * taxRate / 100) : taxRate;
      const serviceAmount = serviceType === "percent" ? Math.floor(subtotal * serviceRate / 100) : serviceRate;
      const totalAmount = subtotal + taxAmount + serviceAmount;

      await sql`
        UPDATE slips SET status = 'closed', payment_method = 'other',
          subtotal = ${subtotal}, tax_amount = ${taxAmount},
          service_amount = ${serviceAmount}, total_amount = ${totalAmount},
          closed_at = NOW(), updated_at = NOW()
        WHERE id = ${slip.id}
      `;
      if (slip.table_id) {
        await sql`UPDATE tables SET status = 'empty', updated_at = NOW() WHERE id = ${slip.table_id}`;
      }
    }

    // Step2: 当日の全伝票（closedも含む）で集計
    const allSlips = await sql`
      SELECT *, (SELECT json_agg(si) FROM slip_items si WHERE si.slip_id = slips.id) as slip_items
      FROM slips WHERE store_id = ${storeId} AND business_date = ${today}::date AND status IN ('closed','locked')
    `;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalRevenue = allSlips.reduce((sum: number, s: any) => sum + Number(s.total_amount ?? 0), 0);

    // NUMERIC型はNeonが文字列で返すのでNumber()変換必須
    const productSummary: Record<string, { name: string; count: number; revenue: number }> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    allSlips.forEach((slip: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (slip.slip_items || []).forEach((item: any) => {
        const key = item.product_name;
        if (!productSummary[key]) productSummary[key] = { name: key, count: 0, revenue: 0 };
        productSummary[key].count += Number(item.quantity);
        productSummary[key].revenue += Number(item.subtotal);
      });
    });

    const productSummaryStr = JSON.stringify(productSummary);

    await sql`
      INSERT INTO daily_sales (store_id, business_date, total_slips, total_revenue, total_customers, product_summary, is_closed, closed_at)
      VALUES (
        ${storeId}, ${today}::date, ${allSlips.length}, ${totalRevenue}, ${allSlips.length},
        ${productSummaryStr}::jsonb, true, NOW()
      )
      ON CONFLICT (store_id, business_date) DO UPDATE SET
        total_slips = EXCLUDED.total_slips, total_revenue = EXCLUDED.total_revenue,
        product_summary = EXCLUDED.product_summary, is_closed = true,
        closed_at = EXCLUDED.closed_at, updated_at = NOW()
    `;

    // operation_logsはベストエフォート
    try {
      const logDataStr = JSON.stringify({ business_date: today, total_revenue: totalRevenue, auto_closed: openSlips.length });
      await sql`INSERT INTO operation_logs (store_id, user_id, action, after_data) VALUES (${storeId}, ${userId}, 'close_day', ${logDataStr}::jsonb)`;
    } catch (logErr) {
      console.warn("[Dashboard POST] operation_logs skipped:", logErr instanceof Error ? logErr.message : logErr);
    }

    return NextResponse.json({ success: true, totalRevenue, autoClosedCount: openSlips.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Dashboard POST] ERROR:", msg);
    return NextResponse.json({ error: "Failed", detail: msg }, { status: 500 });
  }
}
