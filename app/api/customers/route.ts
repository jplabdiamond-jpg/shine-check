import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  try {
    const customers = q
      ? await sql`SELECT * FROM customers WHERE store_id = ${storeId} AND (name ILIKE ${"%" + q + "%"} OR kana ILIKE ${"%" + q + "%"} OR phone ILIKE ${"%" + q + "%"}) ORDER BY last_visit_date DESC NULLS LAST, name`
      : await sql`SELECT * FROM customers WHERE store_id = ${storeId} ORDER BY last_visit_date DESC NULLS LAST, name`;
    return NextResponse.json({ customers });
  } catch (err) {
    console.error("[Customers GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const { name, kana, phone, birthday, memo, preference_notes, ng_notes, tags, is_vip } = await req.json();
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

    const result = await sql`
      INSERT INTO customers (store_id, name, kana, phone, birthday, memo, preference_notes, ng_notes, tags, is_vip, visit_count, total_spend)
      VALUES (${storeId}, ${name}, ${kana ?? null}, ${phone ?? null}, ${birthday ?? null},
              ${memo ?? null}, ${preference_notes ?? null}, ${ng_notes ?? null},
              ${tags ?? []}, ${is_vip ?? false}, 0, 0)
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("[Customers POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const { id, name, kana, phone, birthday, memo, preference_notes, ng_notes, tags, is_vip } = await req.json();
    const result = await sql`
      UPDATE customers SET
        name = ${name}, kana = ${kana ?? null}, phone = ${phone ?? null},
        birthday = ${birthday ?? null}, memo = ${memo ?? null},
        preference_notes = ${preference_notes ?? null}, ng_notes = ${ng_notes ?? null},
        tags = ${tags ?? []}, is_vip = ${is_vip ?? false}, updated_at = NOW()
      WHERE id = ${id} AND store_id = ${storeId}
      RETURNING *
    `;
    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("[Customers PATCH]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  try {
    const { id } = await req.json();
    await sql`DELETE FROM customers WHERE id = ${id} AND store_id = ${storeId}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Customers DELETE]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
