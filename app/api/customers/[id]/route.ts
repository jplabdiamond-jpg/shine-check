import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;
  const { id } = params;
  try {
    const [customerRow] = await sql`SELECT * FROM customers WHERE id = ${id} AND store_id = ${storeId}`;
    if (!customerRow) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const slips = await sql`
      SELECT id, slip_number, name, business_date, total_amount, payment_method, status, closed_at
      FROM slips
      WHERE customer_id = ${id} AND store_id = ${storeId} AND status IN ('closed','locked')
      ORDER BY business_date DESC
      LIMIT 50
    `;
    return NextResponse.json({ customer: customerRow, slips });
  } catch (err) {
    console.error("[Customer GET]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
