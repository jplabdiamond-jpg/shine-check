import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const status = searchParams.get("status");

  try {
    let slips;
    if (date && status) {
      // タイムゾーン考慮: business_dateはDATE型、比較はCASTして実施
      slips = await sql`SELECT * FROM slips WHERE store_id = ${storeId} AND business_date = ${date}::date AND status = ${status} ORDER BY created_at DESC`;
    } else if (date) {
      slips = await sql`SELECT * FROM slips WHERE store_id = ${storeId} AND business_date = ${date}::date ORDER BY created_at DESC`;
    } else {
      slips = await sql`SELECT * FROM slips WHERE store_id = ${storeId} ORDER BY created_at DESC LIMIT 100`;
    }
    return NextResponse.json({ slips });
  } catch (err) {
    console.error("[Slips GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { tableId, customerId, name, setMinutes, setPrice, extensionMinutes, extensionPrice } = body;

    const setPriceNum = Number(setPrice ?? 0);
    const setMinutesNum = Number(setMinutes ?? 60);
    const extMinutesNum = Number(extensionMinutes ?? 30);
    const extPriceNum = Number(extensionPrice ?? 0);

    // 同名伝票チェック（本日のopen伝票）
    if (name) {
      const dup = await sql`SELECT id FROM slips WHERE store_id = ${storeId} AND name = ${name} AND business_date = CURRENT_DATE AND status = 'open' LIMIT 1`;
      if (dup.length > 0) {
        return NextResponse.json({ error: `「${name}」という名前の伝票は既に営業中です` }, { status: 409 });
      }
    }

    // 伝票番号生成 — JST AM3:00基準の営業日
    const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
    if (nowJst.getUTCHours() < 3) nowJst.setUTCDate(nowJst.getUTCDate() - 1);
    const businessDate = nowJst.toISOString().split("T")[0];
    const today = businessDate.replace(/-/g, "");
    const count = await sql`SELECT COUNT(*) as cnt FROM slips WHERE store_id = ${storeId} AND business_date = ${businessDate}::date`;
    const slipNumber = `${today}-${String(Number(count[0].cnt) + 1).padStart(3, "0")}`;

    // 伝票INSERT（subtotalはset_priceで初期化 — slip_itemsにも追加するため整合）
    const result = await sql`
      INSERT INTO slips (
        store_id, table_id, customer_id, slip_number, name,
        set_minutes, set_price, extension_minutes, extension_price,
        timer_started_at, created_by, business_date,
        subtotal
      )
      VALUES (
        ${storeId}, ${tableId ?? null}, ${customerId ?? null}, ${slipNumber}, ${name ?? null},
        ${setMinutesNum}, ${setPriceNum}, ${extMinutesNum}, ${extPriceNum},
        NOW(), ${userId}, ${businessDate}::date,
        ${setPriceNum}
      )
      RETURNING *
    `;

    const slip = result[0];

    // セット料金があればslip_itemsにも追加（商品リストで表示・増減できるように）
    if (setPriceNum > 0) {
      await sql`
        INSERT INTO slip_items (slip_id, product_name, product_price, quantity, subtotal, item_type)
        VALUES (${slip.id}, ${`セット料金 (${setMinutesNum}分)`}, ${setPriceNum}, 1, ${setPriceNum}, 'set')
      `;
    }

    // 卓をoccupiedに
    if (tableId) {
      await sql`UPDATE tables SET status = 'occupied', updated_at = NOW() WHERE id = ${tableId}`;
    }

    return NextResponse.json(slip);
  } catch (err) {
    console.error("[Slips POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
