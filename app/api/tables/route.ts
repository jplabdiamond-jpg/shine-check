import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const tables = await sql`SELECT * FROM tables WHERE store_id = ${storeId} AND is_active = true ORDER BY sort_order`;
    const openSlips = await sql`SELECT * FROM slips WHERE store_id = ${storeId} AND status = 'open'`;
    return NextResponse.json({ tables, openSlips });
  } catch (err) {
    console.error("[Tables GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const { name, table_type, capacity } = await req.json();
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order),0) as max FROM tables WHERE store_id = ${storeId}`;
    const result = await sql`
      INSERT INTO tables (store_id, name, table_type, capacity, sort_order)
      VALUES (${storeId}, ${name}, ${table_type ?? "normal"}, ${capacity ?? 4}, ${(maxOrder[0].max as number) + 1})
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("[Tables POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("id");
    if (!tableId) return NextResponse.json({ error: "id required" }, { status: 400 });
    await sql`UPDATE tables SET is_active = false, updated_at = NOW() WHERE id = ${tableId} AND store_id = ${storeId}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Tables DELETE]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
