import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const [products, categories] = await Promise.all([
      sql`SELECT * FROM products WHERE store_id = ${storeId} AND is_active = true ORDER BY sort_order, name`,
      sql`SELECT * FROM product_categories WHERE store_id = ${storeId} ORDER BY sort_order`,
    ]);
    return NextResponse.json({ products, categories });
  } catch (err) {
    console.error("[Products GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

const FREE_PLAN_PRODUCT_LIMIT = 10;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const { name, price, category_id, is_favorite } = await req.json();

    // プラン確認・商品数チェック
    const [storeRow] = await sql`SELECT plan FROM stores WHERE id = ${storeId}`;
    const isPremium = storeRow?.plan === "premium";

    if (!isPremium) {
      const [countRow] = await sql`SELECT COUNT(*) as cnt FROM products WHERE store_id = ${storeId} AND is_active = true`;
      const count = Number(countRow?.cnt ?? 0);
      if (count >= FREE_PLAN_PRODUCT_LIMIT) {
        return NextResponse.json(
          { error: "PLAN_LIMIT", message: `無料プランは商品を${FREE_PLAN_PRODUCT_LIMIT}件まで登録できます。プレミアムプランにアップグレードすると無制限に登録できます。` },
          { status: 403 }
        );
      }
    }

    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order),0) as max FROM products WHERE store_id = ${storeId}`;
    const result = await sql`
      INSERT INTO products (store_id, name, price, category_id, is_favorite, sort_order)
      VALUES (${storeId}, ${name}, ${price}, ${category_id ?? null}, ${is_favorite ?? false}, ${(maxOrder[0].max as number) + 1})
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("[Products POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const { id, name, price, category_id, is_favorite } = await req.json();
    const result = await sql`
      UPDATE products SET name = ${name}, price = ${price}, category_id = ${category_id ?? null},
        is_favorite = ${is_favorite ?? false}, updated_at = NOW()
      WHERE id = ${id} AND store_id = ${storeId}
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("[Products PATCH]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const { id } = await req.json();
    await sql`UPDATE products SET is_active = false, updated_at = NOW() WHERE id = ${id} AND store_id = ${storeId}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Products DELETE]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
