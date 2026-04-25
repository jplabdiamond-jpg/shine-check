import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;

  try {
    const slips = await sql`SELECT * FROM slips WHERE id = ${params.id} AND store_id = ${storeId}`;
    if (!slips.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const items = await sql`SELECT * FROM slip_items WHERE slip_id = ${params.id} ORDER BY created_at`;
    return NextResponse.json({ slip: slips[0], items });
  } catch (err) {
    console.error("[Slip GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  const userId = session.user.id;
  const sessionCastId = session.user.castId ?? null;

  try {
    const body = await req.json();
    const { action, ...data } = body;

    if (action === "close") {
      // 会計処理 — サーバー側で合計を再計算して NaN/undefined 混入を防ぐ
      const { paymentMethod } = data;

      // 店舗の税率・サービス料をDBから取得（フロントのstore参照に依存しない）
      const storeRow = await sql`SELECT tax_rate, service_rate, tax_type, service_type FROM stores WHERE id = ${storeId}`;
      const s = storeRow[0];

      // subtotal = slip_items合計（set料金アイテムも含まれる）
      const itemsSum = await sql`SELECT COALESCE(SUM(subtotal),0) as total FROM slip_items WHERE slip_id = ${params.id}`;
      const subtotal = Number(itemsSum[0].total);

      const taxRate = Number(s?.tax_rate ?? 0);
      const serviceRate = Number(s?.service_rate ?? 0);
      const taxType = s?.tax_type ?? "percent";
      const serviceType = s?.service_type ?? "percent";

      const taxAmount = taxType === "percent" ? Math.floor(subtotal * taxRate / 100) : taxRate;
      const serviceAmount = serviceType === "percent" ? Math.floor(subtotal * serviceRate / 100) : serviceRate;
      const totalAmount = subtotal + taxAmount + serviceAmount;

      await sql`
        UPDATE slips SET status = 'closed', payment_method = ${paymentMethod},
          subtotal = ${subtotal}, tax_amount = ${taxAmount},
          service_amount = ${serviceAmount}, total_amount = ${totalAmount},
          closed_at = NOW(), closed_by = ${userId}, updated_at = NOW()
        WHERE id = ${params.id} AND store_id = ${storeId}
      `;
      // 卓を空席に
      const slip = await sql`SELECT table_id FROM slips WHERE id = ${params.id}`;
      if (slip[0]?.table_id) {
        await sql`UPDATE tables SET status = 'empty', updated_at = NOW() WHERE id = ${slip[0].table_id}`;
      }
    } else if (action === "add_item") {
      const { productId, productName, productPrice, quantity, itemType } = data;
      // castIdはリクエストから受け取るか、セッションのキャストIDを使用
      const castId = data.castId ?? sessionCastId;
      const effectiveItemType = itemType ?? "product";

      // セット・延長・shimei・douhanはcast_idを分けて管理（まとめない）
      const mergeable = effectiveItemType === "product";

      if (productId && mergeable) {
        // 同じproduct_id & 同じcast_idなら数量加算
        // castIdのnull/non-nullで分岐（neon sqlテンプレートで ${x} IS NULL は構文エラー）
        const existing = castId
          ? await sql`
              SELECT id, quantity FROM slip_items
              WHERE slip_id = ${params.id} AND product_id = ${productId}
                AND item_type = 'product' AND cast_id = ${castId}
            `
          : await sql`
              SELECT id, quantity FROM slip_items
              WHERE slip_id = ${params.id} AND product_id = ${productId}
                AND item_type = 'product' AND cast_id IS NULL
            `;
        if (existing.length > 0) {
          const newQty = Number(existing[0].quantity) + Number(quantity);
          const newSub = Number(productPrice) * newQty;
          await sql`UPDATE slip_items SET quantity = ${newQty}, subtotal = ${newSub}, updated_at = NOW() WHERE id = ${existing[0].id}`;
        } else {
          const sub = Number(productPrice) * Number(quantity);
          await sql`INSERT INTO slip_items (slip_id, product_id, product_name, product_price, quantity, subtotal, cast_id, item_type) VALUES (${params.id}, ${productId}, ${productName}, ${productPrice}, ${quantity}, ${sub}, ${castId}, ${effectiveItemType})`;
        }
      } else {
        const sub = Number(productPrice) * Number(quantity);
        await sql`INSERT INTO slip_items (slip_id, product_id, product_name, product_price, quantity, subtotal, cast_id, item_type) VALUES (${params.id}, ${productId ?? null}, ${productName}, ${productPrice}, ${quantity}, ${sub}, ${castId}, ${effectiveItemType})`;
      }
      await sql`UPDATE slips SET subtotal = (SELECT COALESCE(SUM(subtotal),0) FROM slip_items WHERE slip_id = ${params.id}), updated_at = NOW() WHERE id = ${params.id}`;
    } else if (action === "update_item") {
      // 数量のみ更新
      const { itemId, quantity } = data;
      const item = await sql`SELECT product_price FROM slip_items WHERE id = ${itemId} AND slip_id = ${params.id}`;
      if (item.length > 0) {
        const newSub = Number(item[0].product_price) * Number(quantity);
        await sql`UPDATE slip_items SET quantity = ${quantity}, subtotal = ${newSub}, updated_at = NOW() WHERE id = ${itemId}`;
        await sql`UPDATE slips SET subtotal = (SELECT COALESCE(SUM(subtotal),0) FROM slip_items WHERE slip_id = ${params.id}), updated_at = NOW() WHERE id = ${params.id}`;
      }
    } else if (action === "remove_item") {
      await sql`DELETE FROM slip_items WHERE id = ${data.itemId} AND slip_id = ${params.id}`;
      await sql`
        UPDATE slips SET subtotal = (SELECT COALESCE(SUM(subtotal),0) FROM slip_items WHERE slip_id = ${params.id}),
          updated_at = NOW() WHERE id = ${params.id}
      `;
    } else if (action === "extend") {
      await sql`
        UPDATE slips SET extension_count = extension_count + 1, updated_at = NOW()
        WHERE id = ${params.id} AND store_id = ${storeId}
      `;
    } else if (action === "reset_timer") {
      // セット/延長追加時にタイマーをリセット
      await sql`
        UPDATE slips SET timer_started_at = NOW(), updated_at = NOW()
        WHERE id = ${params.id} AND store_id = ${storeId}
      `;
    } else {
      // 汎用UPDATE
      const fields = Object.entries(data).filter(([k]) => ["name","notes","customer_id","table_id"].includes(k));
      if (fields.length) {
        for (const [key, value] of fields) {
          if (key === "name") await sql`UPDATE slips SET name = ${value as string}, updated_at = NOW() WHERE id = ${params.id}`;
          if (key === "notes") await sql`UPDATE slips SET notes = ${value as string}, updated_at = NOW() WHERE id = ${params.id}`;
        }
      }
    }

    const updated = await sql`SELECT * FROM slips WHERE id = ${params.id}`;
    const items = await sql`SELECT * FROM slip_items WHERE slip_id = ${params.id} ORDER BY created_at`;
    return NextResponse.json({ slip: updated[0], items });
  } catch (err) {
    console.error("[Slip PATCH]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;

  try {
    const slip = await sql`SELECT table_id FROM slips WHERE id = ${params.id} AND store_id = ${storeId}`;
    await sql`UPDATE slips SET status = 'voided', updated_at = NOW() WHERE id = ${params.id} AND store_id = ${storeId}`;
    if (slip[0]?.table_id) {
      await sql`UPDATE tables SET status = 'empty', updated_at = NOW() WHERE id = ${slip[0].table_id}`;
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Slip DELETE]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
