import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const r = await sql`SELECT 1 as ok, current_database() as db`;
    const raw = process.env.DATABASE_URL || "";
    const preview = raw.substring(0, 55) + "...";
    return NextResponse.json({
      success: true,
      result: r[0],
      db_url_preview: preview,
      db_url_length: raw.length,
    });
  } catch (e) {
    const raw = process.env.DATABASE_URL || "(empty)";
    return NextResponse.json({
      error: String(e),
      db_url_preview: raw.substring(0, 55) + "...",
      db_url_length: raw.length,
    }, { status: 500 });
  }
}
