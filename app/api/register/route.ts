import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { storeName, email, password } = await req.json();
    if (!storeName || !email || !password) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "パスワードは6文字以上です" }, { status: 400 });
    }

    // メール重複チェック
    const existing = await sql`SELECT id FROM store_users WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "このメールアドレスは既に登録されています" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 1. 店舗作成
    const stores = await sql`
      INSERT INTO stores (name, plan) VALUES (${storeName}, 'standard')
      RETURNING id
    `;
    const storeId = stores[0].id as string;

    // 2. 管理者ユーザー作成
    const users = await sql`
      INSERT INTO store_users (store_id, email, name, password_hash, role)
      VALUES (${storeId}, ${email}, ${storeName + " 管理者"}, ${passwordHash}, 'admin')
      RETURNING id
    `;
    const userId = users[0].id as string;

    // 3. デフォルトカテゴリ
    const categories = await sql`
      INSERT INTO product_categories (store_id, name, sort_order, color) VALUES
        (${storeId}, 'ドリンク', 1, '#FF2D78'),
        (${storeId}, 'フード',   2, '#09825D'),
        (${storeId}, 'ボトル',   3, '#DF1B41'),
        (${storeId}, 'その他',   4, '#8792A2')
      RETURNING id, name
    `;
    const drinkCatId = categories[0].id as string;

    // 4. デフォルト商品
    await sql`
      INSERT INTO products (store_id, category_id, name, price, is_favorite, sort_order) VALUES
        (${storeId}, ${drinkCatId}, 'ビール',     800, true,  1),
        (${storeId}, ${drinkCatId}, 'ハイボール', 700, true,  2),
        (${storeId}, ${drinkCatId}, 'カクテル',   900, false, 3),
        (${storeId}, ${drinkCatId}, 'ウーロン茶', 500, false, 4)
    `;

    // 5. デフォルト卓
    await sql`
      INSERT INTO tables (store_id, name, table_type, sort_order) VALUES
        (${storeId}, '1卓', 'normal', 1),
        (${storeId}, '2卓', 'normal', 2),
        (${storeId}, '3卓', 'normal', 3),
        (${storeId}, 'VIP', 'vip',    4)
    `;

    return NextResponse.json({ success: true, userId, storeId });
  } catch (err) {
    console.error("[Register Error]", err);
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}
