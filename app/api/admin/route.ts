import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

function checkAuth(req: NextRequest): boolean {
  const cookie = req.cookies.get("admin_token")?.value;
  const header = req.headers.get("x-admin-secret");
  const secret = process.env.ADMIN_SECRET;
  return !!(secret && (cookie === secret || header === secret));
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. 全店舗一覧（プラン・Stripe・設定情報含む）
    const stores = await sql`
      SELECT
        s.id,
        s.name,
        s.plan,
        s.plan_expires_at,
        s.stripe_customer_id,
        s.stripe_subscription_id,
        s.tax_rate,
        s.service_rate,
        s.tax_type,
        s.service_type,
        s.daily_slip_limit,
        s.settings,
        s.created_at,
        s.updated_at,
        COUNT(DISTINCT su.id) FILTER (WHERE su.is_active = true) AS active_user_count,
        COUNT(DISTINCT su.id) FILTER (WHERE su.role = 'admin') AS admin_count
      FROM stores s
      LEFT JOIN store_users su ON su.store_id = s.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;

    // 2. 全ユーザー一覧（パスワードハッシュ除外）
    const users = await sql`
      SELECT
        su.id,
        su.store_id,
        su.email,
        su.name,
        su.role,
        su.is_active,
        su.created_at,
        su.last_login_at,
        s.name AS store_name,
        s.plan AS store_plan
      FROM store_users su
      JOIN stores s ON s.id = su.store_id
      ORDER BY su.created_at DESC
    `;

    // 3. 売上サマリー（店舗別・全期間）
    const salesSummary = await sql`
      SELECT
        ds.store_id,
        s.name AS store_name,
        COUNT(*) AS total_days_closed,
        SUM(ds.total_revenue) AS lifetime_revenue,
        SUM(ds.total_slips) AS lifetime_slips,
        SUM(ds.total_customers) AS lifetime_customers,
        MAX(ds.business_date) AS last_closed_date
      FROM daily_sales ds
      JOIN stores s ON s.id = ds.store_id
      WHERE ds.is_closed = true
      GROUP BY ds.store_id, s.name
      ORDER BY lifetime_revenue DESC NULLS LAST
    `;

    // 4. 最近30日の売上（全店合計）
    const recentSales = await sql`
      SELECT
        business_date,
        SUM(total_revenue) AS daily_total,
        SUM(total_slips) AS daily_slips,
        COUNT(DISTINCT store_id) AS active_stores
      FROM daily_sales
      WHERE business_date >= CURRENT_DATE - INTERVAL '30 days'
        AND is_closed = true
      GROUP BY business_date
      ORDER BY business_date DESC
    `;

    // 5. 全キャスト一覧
    const casts = await sql`
      SELECT
        c.id,
        c.store_id,
        c.name,
        c.stage_name,
        c.hourly_wage,
        c.drink_back_rate,
        c.shimei_back_rate,
        c.douhan_back_rate,
        c.extension_back_rate,
        c.is_active,
        c.created_at,
        s.name AS store_name
      FROM casts c
      JOIN stores s ON s.id = c.store_id
      ORDER BY s.name, c.name
    `;

    // 6. 全商品一覧（単価含む）
    const products = await sql`
      SELECT
        p.id,
        p.store_id,
        p.name,
        p.price,
        p.is_active,
        p.created_at,
        s.name AS store_name,
        pc.name AS category_name
      FROM products p
      JOIN stores s ON s.id = p.store_id
      LEFT JOIN product_categories pc ON pc.id = p.category_id
      ORDER BY s.name, pc.name NULLS LAST, p.name
    `;

    // 7. 統計サマリー
    const statsRaw = await sql`
      SELECT
        (SELECT COUNT(*) FROM stores) AS total_stores,
        (SELECT COUNT(*) FROM stores WHERE plan = 'premium') AS premium_stores,
        (SELECT COUNT(*) FROM stores WHERE plan = 'standard') AS standard_stores,
        (SELECT COUNT(*) FROM store_users WHERE is_active = true) AS total_active_users,
        (SELECT COALESCE(SUM(total_revenue), 0) FROM daily_sales WHERE is_closed = true) AS all_time_revenue,
        (SELECT COUNT(*) FROM slips WHERE status = 'closed') AS all_time_slips,
        (SELECT COUNT(*) FROM casts WHERE is_active = true) AS total_active_casts,
        (SELECT COUNT(*) FROM products WHERE is_active = true) AS total_active_products,
        (SELECT COUNT(*) FROM customers) AS total_customers
    `;
    const stats = statsRaw[0];

    return NextResponse.json({
      success: true,
      stats,
      stores,
      users,
      salesSummary,
      recentSales,
      casts,
      products,
    });
  } catch (err) {
    console.error("[Admin API] ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: String(err) },
      { status: 500 }
    );
  }
}

// ログイン（ADMIN_SECRETを検証してクッキーをセット）
export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json();
    const envSecret = process.env.ADMIN_SECRET ?? "";
    console.log("[Admin POST] secret_len:", secret?.length, "env_len:", envSecret.length, "match:", secret === envSecret);
    if (!envSecret || secret !== envSecret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_token", secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 8, // 8時間
      path: "/",
    });
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: "Bad Request", detail: String(err) },
      { status: 400 }
    );
  }
}

// ログアウト
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("admin_token");
  return res;
}
