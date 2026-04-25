import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "無効なトークンです" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "パスワードは8文字以上で入力してください" }, { status: 400 });
    }

    // トークン検証
    const tokens = await sql`
      SELECT prt.id, prt.user_id, prt.expires_at, prt.used_at, su.email
      FROM password_reset_tokens prt
      JOIN store_users su ON su.id = prt.user_id
      WHERE prt.token = ${token}
      LIMIT 1
    `;

    if (tokens.length === 0) {
      return NextResponse.json({ error: "無効なリセットリンクです" }, { status: 400 });
    }

    const t = tokens[0] as { id: string; user_id: string; expires_at: string; used_at: string | null; email: string };

    if (t.used_at) {
      return NextResponse.json({ error: "このリンクはすでに使用済みです" }, { status: 400 });
    }

    if (new Date(t.expires_at) < new Date()) {
      return NextResponse.json({ error: "リセットリンクの有効期限が切れています。再度リセットをリクエストしてください。" }, { status: 400 });
    }

    // パスワードをハッシュ化して更新
    const hash = await bcrypt.hash(password, 12);

    await sql`
      UPDATE store_users
      SET password_hash = ${hash}, updated_at = NOW()
      WHERE id = ${t.user_id}
    `;

    // トークンを使用済みにする
    await sql`
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = ${t.id}
    `;

    console.log(`[RESET CONFIRM] Password updated for user: ${t.email}`);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[RESET CONFIRM] ERROR:", e);
    return NextResponse.json({ error: "パスワードの更新に失敗しました", detail: String(e) }, { status: 500 });
  }
}
