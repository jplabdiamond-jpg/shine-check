import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const casts = await sql`
      SELECT c.*, su.email as login_email
      FROM casts c
      LEFT JOIN store_users su ON su.id = c.user_id
      WHERE c.store_id = ${storeId} AND c.is_active = true
      ORDER BY c.name
    `;
    return NextResponse.json({ casts });
  } catch (err) {
    console.error("[Casts GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const {
      name, stage_name,
      drink_back_rate, shimei_back_rate, douhan_back_rate, extension_back_rate, hourly_wage,
      login_email, login_password,
    } = await req.json();

    // キャスト登録
    const castResult = await sql`
      INSERT INTO casts (store_id, name, stage_name, drink_back_rate, shimei_back_rate, douhan_back_rate, extension_back_rate, hourly_wage)
      VALUES (${storeId}, ${name}, ${stage_name ?? null}, ${drink_back_rate ?? 20}, ${shimei_back_rate ?? 30}, ${douhan_back_rate ?? 50}, ${extension_back_rate ?? 30}, ${hourly_wage ?? 0})
      RETURNING *
    `;
    const cast = castResult[0];

    // ログインID・パスワードが設定されていればstore_usersにも登録
    if (login_email && login_password) {
      const existing = await sql`SELECT id FROM store_users WHERE email = ${login_email} LIMIT 1`;
      if (existing.length > 0) {
        return NextResponse.json({ error: "このメールアドレスは既に使用されています" }, { status: 409 });
      }
      const hash = await bcrypt.hash(login_password, 10);
      const userResult = await sql`
        INSERT INTO store_users (store_id, email, name, password_hash, role, cast_id)
        VALUES (${storeId}, ${login_email}, ${stage_name || name}, ${hash}, 'staff', ${cast.id})
        RETURNING id
      `;
      // casts.user_id に紐付け
      await sql`UPDATE casts SET user_id = ${userResult[0].id} WHERE id = ${cast.id}`;
      const updated = await sql`SELECT c.*, su.email as login_email FROM casts c LEFT JOIN store_users su ON su.id = c.user_id WHERE c.id = ${cast.id}`;
      return NextResponse.json(updated[0]);
    }

    return NextResponse.json(cast);
  } catch (err) {
    console.error("[Casts POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const {
      id, name, stage_name,
      drink_back_rate, shimei_back_rate, douhan_back_rate, extension_back_rate, hourly_wage,
      login_email, login_password,
    } = await req.json();

    await sql`
      UPDATE casts SET name = ${name}, stage_name = ${stage_name ?? null},
        drink_back_rate = ${drink_back_rate ?? 20}, shimei_back_rate = ${shimei_back_rate ?? 30},
        douhan_back_rate = ${douhan_back_rate ?? 50}, extension_back_rate = ${extension_back_rate ?? 30},
        hourly_wage = ${hourly_wage ?? 0}, updated_at = NOW()
      WHERE id = ${id} AND store_id = ${storeId}
    `;

    // ログイン情報の更新/新規設定
    if (login_email) {
      const cast = await sql`SELECT user_id FROM casts WHERE id = ${id}`;
      const existingUserId = cast[0]?.user_id;

      if (existingUserId) {
        // 既存のstore_userを更新
        await sql`UPDATE store_users SET email = ${login_email}, name = ${stage_name || name}, updated_at = NOW() WHERE id = ${existingUserId}`;
        if (login_password) {
          const hash = await bcrypt.hash(login_password, 10);
          await sql`UPDATE store_users SET password_hash = ${hash}, updated_at = NOW() WHERE id = ${existingUserId}`;
        }
      } else {
        // 新規store_user作成
        const dup = await sql`SELECT id FROM store_users WHERE email = ${login_email} AND store_id = ${storeId} LIMIT 1`;
        if (dup.length === 0 && login_password) {
          const hash = await bcrypt.hash(login_password, 10);
          const userResult = await sql`
            INSERT INTO store_users (store_id, email, name, password_hash, role, cast_id)
            VALUES (${storeId}, ${login_email}, ${stage_name || name}, ${hash}, 'staff', ${id})
            RETURNING id
          `;
          await sql`UPDATE casts SET user_id = ${userResult[0].id} WHERE id = ${id}`;
        }
      }
    }

    const result = await sql`SELECT c.*, su.email as login_email FROM casts c LEFT JOIN store_users su ON su.id = c.user_id WHERE c.id = ${id}`;
    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("[Casts PATCH]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const { id } = await req.json();
    // 紐付きstore_userを無効化
    const cast = await sql`SELECT user_id FROM casts WHERE id = ${id} AND store_id = ${storeId}`;
    if (cast[0]?.user_id) {
      await sql`UPDATE store_users SET is_active = false WHERE id = ${cast[0].user_id}`;
    }
    await sql`UPDATE casts SET is_active = false, updated_at = NOW() WHERE id = ${id} AND store_id = ${storeId}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Casts DELETE]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
