import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;

  try {
    const body = await req.json();
    console.log("[Settings PATCH] body:", JSON.stringify(body));
    const { name, tax_rate, service_rate, tax_type, service_type, settings } = body;

    let result;
    if (settings !== undefined) {
      console.log("[Settings PATCH] updating settings:", JSON.stringify(settings));
      // neonドライバーはオブジェクトをJSONBとして自動処理する
      // 文字列ではなくオブジェクトをそのまま渡す
      const settingsObj = typeof settings === "string" ? JSON.parse(settings) : settings;
      result = await sql`UPDATE stores SET settings = ${JSON.stringify(settingsObj)}::jsonb, updated_at = NOW() WHERE id = ${storeId} RETURNING *`;
      console.log("[Settings PATCH] success, rows:", result.length);
    } else {
      result = await sql`
        UPDATE stores SET name = ${name}, tax_rate = ${tax_rate}, service_rate = ${service_rate},
          tax_type = ${tax_type}, service_type = ${service_type}, updated_at = NOW()
        WHERE id = ${storeId} RETURNING *
      `;
    }
    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("[Settings PATCH] error:", err);
    return NextResponse.json({ error: "Failed", detail: String(err) }, { status: 500 });
  }
}
