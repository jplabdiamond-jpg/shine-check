import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { sql } from "@/lib/db";

// "HH:MM" (JST) → UTC ISOString
function jstTimeToIso(timeStr: string): string {
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const [h, m] = timeStr.split(":").map(Number);
  const utcH = h - 9;
  return new Date(Date.UTC(
    nowJst.getUTCFullYear(),
    nowJst.getUTCMonth(),
    nowJst.getUTCDate(),
    utcH, m, 0, 0
  )).toISOString();
}

// JST AM3:00基準の営業日
function getTodayJst(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  if (jst.getUTCHours() < 3) jst.setUTCDate(jst.getUTCDate() - 1);
  return jst.toISOString().split("T")[0];
}

// POST: 出勤打刻 / 退勤打刻
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.storeId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const storeId = session.user.storeId;

  try {
    const { castId, action, checkinTime, checkoutTime } = await req.json();
    // action: "checkin" | "checkout" | "reset"

    if (action === "checkin") {
      const checkinIso = checkinTime ? jstTimeToIso(checkinTime) : new Date().toISOString();
      // 退勤時間も一緒に入力されていた場合は保存（「✕退勤」ボタンで上書き可能）
      const checkoutIso = checkoutTime ? jstTimeToIso(checkoutTime) : null;

      const result = await sql`
        UPDATE casts
        SET today_checkin_at = ${checkinIso},
            today_checkout_at = ${checkoutIso},
            updated_at = NOW()
        WHERE id = ${castId} AND store_id = ${storeId}
        RETURNING *
      `;
      return NextResponse.json({ cast: result[0] });

    } else if (action === "checkout") {
      // 「✕退勤」ボタン → 常に現在時刻で上書き（予め入力した退勤時間より優先）
      const nowIso = new Date().toISOString();
      const result = await sql`
        UPDATE casts SET today_checkout_at = ${nowIso}, updated_at = NOW()
        WHERE id = ${castId} AND store_id = ${storeId}
        RETURNING *
      `;
      return NextResponse.json({ cast: result[0] });

    } else if (action === "reset") {
      const result = await sql`
        UPDATE casts SET today_checkin_at = NULL, today_checkout_at = NULL, updated_at = NOW()
        WHERE id = ${castId} AND store_id = ${storeId}
        RETURNING *
      `;
      return NextResponse.json({ cast: result[0] });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[Attendance POST]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
