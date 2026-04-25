import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES store_users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_prt_token ON password_reset_tokens(token)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id)`;
    console.log("[MIGRATION] password_reset_tokens created");
    return NextResponse.json({ success: true, message: "password_reset_tokens table created" });
  } catch (e) {
    console.error("[MIGRATION ERROR]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
