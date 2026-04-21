"use client";

import { useState, useEffect, useCallback } from "react";

// ─── 型定義 ───────────────────────────────────────────────
interface Stats {
  total_stores: string;
  premium_stores: string;
  standard_stores: string;
  total_active_users: string;
  all_time_revenue: string;
  all_time_slips: string;
  total_active_casts: string;
  total_active_products: string;
  total_customers: string;
}

interface StoreRow {
  id: string;
  name: string;
  plan: string;
  plan_expires_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tax_rate: string;
  service_rate: string;
  tax_type: string;
  service_type: string;
  daily_slip_limit: string;
  settings: Record<string, unknown>;
  created_at: string;
  active_user_count: string;
  admin_count: string;
}

interface UserRow {
  id: string;
  store_id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  store_name: string;
  store_plan: string;
}

interface SalesSummaryRow {
  store_id: string;
  store_name: string;
  total_days_closed: string;
  lifetime_revenue: string;
  lifetime_slips: string;
  lifetime_customers: string;
  last_closed_date: string | null;
}

interface CastRow {
  id: string;
  store_id: string;
  name: string;
  stage_name: string | null;
  hourly_wage: string;
  drink_back_rate: string;
  shimei_back_rate: string;
  douhan_back_rate: string;
  extension_back_rate: string;
  is_active: boolean;
  store_name: string;
}

interface ProductRow {
  id: string;
  store_id: string;
  name: string;
  price: string;
  is_active: boolean;
  store_name: string;
  category_name: string | null;
}

interface AdminData {
  stats: Stats;
  stores: StoreRow[];
  users: UserRow[];
  salesSummary: SalesSummaryRow[];
  recentSales: { business_date: string; daily_total: string; daily_slips: string; active_stores: string }[];
  casts: CastRow[];
  products: ProductRow[];
}

// ─── ユーティリティ ───────────────────────────────────────
function formatCurrency(v: string | number | null | undefined): string {
  const n = Number(v ?? 0);
  return `¥${n.toLocaleString("ja-JP")}`;
}
function formatDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" });
}
function planBadge(plan: string) {
  return plan === "premium" ? (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-400 text-yellow-900">PREMIUM</span>
  ) : (
    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-200 text-gray-600">FREE</span>
  );
}

// ─── タブ定義 ───────────────────────────────────────────────
type Tab = "overview" | "stores" | "users" | "sales" | "casts" | "products";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "📊 概要" },
  { id: "stores", label: "🏪 店舗" },
  { id: "users", label: "👥 ユーザー" },
  { id: "sales", label: "💰 売上" },
  { id: "casts", label: "💃 キャスト" },
  { id: "products", label: "🍺 商品" },
];

// ─── メインコンポーネント ──────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [secret, setSecret] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [storeFilter, setStoreFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin");
      if (res.status === 401) { setAuthed(false); return; }
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      if (res.ok) {
        setAuthed(true);
        fetchData();
      } else {
        setLoginError("パスワードが違います");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin", { method: "DELETE" });
    setAuthed(false);
    setData(null);
  };

  // クッキーが残っていれば自動ログイン試行（リロード後もセッション維持）
  useEffect(() => {
    fetch("/api/admin").then(async (res) => {
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.stats) { setAuthed(true); setData(json); }
      }
    });
  }, []);

  // ─── ログイン画面 ───────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#030712" }}>
        <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-80 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">✨</div>
            <h1 className="text-white text-xl font-bold">Shine Check Admin</h1>
            <p className="text-gray-400 text-sm mt-1">管理者専用パネル</p>
          </div>
          <input
            type="password"
            placeholder="管理者パスワード"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2.5 mb-3 focus:outline-none focus:border-yellow-400 text-sm"
          />
          {loginError && <p className="text-red-400 text-xs mb-3">{loginError}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "確認中..." : "ログイン"}
          </button>
        </form>
      </div>
    );
  }

  // ─── ローディング ───────────────────────────────────────
  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#030712" }}>
        <p className="text-white">読み込み中...</p>
      </div>
    );
  }
  if (!data) return null;

  const { stats, stores, users, salesSummary, recentSales, casts, products } = data;
  const filteredStores = stores.filter(s => storeFilter === "all" || s.plan === storeFilter);

  // ─── メイン画面 ─────────────────────────────────────────
  return (
    <div className="min-h-screen text-gray-100" style={{ background: "#030712", color: "#f3f4f6" }}>
      {/* ヘッダー */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-10" style={{ background: "#111827" }}>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xl">✨</span>
          <span className="font-bold text-white">Shine Check Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="text-gray-400 hover:text-white text-sm px-3 py-1 border border-gray-700 rounded-lg transition">
            更新
          </button>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 text-sm px-3 py-1 border border-gray-700 rounded-lg transition">
            ログアウト
          </button>
        </div>
      </header>

      {/* タブ */}
      <nav className="border-b border-gray-800 px-4 overflow-x-auto" style={{ background: "#111827" }}>
        <div className="flex gap-1 min-w-max">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                tab === t.id
                  ? "border-yellow-400 text-yellow-400"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="p-4 max-w-7xl mx-auto">

        {/* ── 概要タブ ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white mt-2">全体統計</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { label: "総店舗数", value: stats.total_stores, icon: "🏪" },
                { label: "有料（Premium）", value: stats.premium_stores, icon: "⭐" },
                { label: "無料（Standard）", value: stats.standard_stores, icon: "🆓" },
                { label: "アクティブユーザー", value: stats.total_active_users, icon: "👥" },
                { label: "累計売上", value: formatCurrency(stats.all_time_revenue), icon: "💰" },
                { label: "累計伝票数", value: Number(stats.all_time_slips).toLocaleString(), icon: "🧾" },
                { label: "キャスト数", value: stats.total_active_casts, icon: "💃" },
                { label: "商品数", value: stats.total_active_products, icon: "🍺" },
                { label: "顧客数", value: stats.total_customers, icon: "🧑" },
              ].map(item => (
                <div key={item.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-xl mb-1">{item.icon}</div>
                  <div className="text-2xl font-bold text-white">{item.value}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.label}</div>
                </div>
              ))}
            </div>

            {/* 直近30日売上 */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="font-bold text-white mb-3">直近30日の日次売上</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="text-left pb-2">日付</th>
                      <th className="text-right pb-2">売上</th>
                      <th className="text-right pb-2">伝票数</th>
                      <th className="text-right pb-2">稼働店舗</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentSales.slice(0, 15).map(row => (
                      <tr key={row.business_date} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-2">{formatDate(row.business_date)}</td>
                        <td className="text-right text-green-400">{formatCurrency(row.daily_total)}</td>
                        <td className="text-right">{row.daily_slips}</td>
                        <td className="text-right">{row.active_stores}</td>
                      </tr>
                    ))}
                    {recentSales.length === 0 && (
                      <tr><td colSpan={4} className="text-center text-gray-500 py-4">データなし</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── 店舗タブ ── */}
        {tab === "stores" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mt-2">
              <h2 className="text-lg font-bold text-white">店舗一覧 ({filteredStores.length}件)</h2>
              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="all">すべて</option>
                <option value="premium">Premium</option>
                <option value="standard">Standard</option>
              </select>
            </div>
            <div className="space-y-3">
              {filteredStores.map(s => (
                <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{s.name}</span>
                        {planBadge(s.plan)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">ID: {s.id}</div>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <div>登録: {formatDate(s.created_at)}</div>
                      {s.plan_expires_at && <div>期限: {formatDate(s.plan_expires_at)}</div>}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-gray-800 rounded-lg p-2">
                      <div className="text-gray-400">ユーザー数</div>
                      <div className="text-white font-bold">{s.active_user_count}人</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <div className="text-gray-400">税率</div>
                      <div className="text-white font-bold">{Number(s.tax_rate)}% ({s.tax_type})</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <div className="text-gray-400">サービス料</div>
                      <div className="text-white font-bold">{Number(s.service_rate)}% ({s.service_type})</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2">
                      <div className="text-gray-400">日次上限</div>
                      <div className="text-white font-bold">{s.daily_slip_limit}枚</div>
                    </div>
                  </div>
                  {/* settings JSONB展開 */}
                  {s.settings && Object.keys(s.settings).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">設定詳細を表示</summary>
                      <pre className="mt-2 text-xs bg-gray-800 rounded-lg p-3 overflow-x-auto text-gray-300">
                        {JSON.stringify(s.settings, null, 2)}
                      </pre>
                    </details>
                  )}
                  {s.stripe_customer_id && (
                    <div className="mt-2 text-xs text-gray-500">
                      Stripe: {s.stripe_customer_id} / {s.stripe_subscription_id ?? "—"}
                    </div>
                  )}
                </div>
              ))}
              {filteredStores.length === 0 && (
                <div className="text-center text-gray-500 py-8">店舗データなし</div>
              )}
            </div>
          </div>
        )}

        {/* ── ユーザータブ ── */}
        {tab === "users" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mt-2">ユーザー一覧 ({users.length}件)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800 text-left">
                    <th className="pb-2 pr-4">名前</th>
                    <th className="pb-2 pr-4">メール</th>
                    <th className="pb-2 pr-4">店舗</th>
                    <th className="pb-2 pr-4">プラン</th>
                    <th className="pb-2 pr-4">役割</th>
                    <th className="pb-2 pr-4">状態</th>
                    <th className="pb-2 pr-4">登録日</th>
                    <th className="pb-2">最終ログイン</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 pr-4 font-medium text-white">{u.name || "—"}</td>
                      <td className="py-2 pr-4 text-gray-300">{u.email}</td>
                      <td className="py-2 pr-4 text-gray-300">{u.store_name}</td>
                      <td className="py-2 pr-4">{planBadge(u.store_plan)}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          u.role === "admin" ? "bg-red-900 text-red-300" :
                          u.role === "manager" ? "bg-blue-900 text-blue-300" :
                          "bg-gray-800 text-gray-400"
                        }`}>{u.role}</span>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${u.is_active ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}>
                          {u.is_active ? "有効" : "無効"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-gray-400">{formatDate(u.created_at)}</td>
                      <td className="py-2 text-gray-400">{formatDate(u.last_login_at)}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={8} className="text-center text-gray-500 py-4">データなし</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 売上タブ ── */}
        {tab === "sales" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mt-2">店舗別売上サマリー</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800 text-left">
                    <th className="pb-2 pr-4">店舗名</th>
                    <th className="pb-2 pr-4 text-right">累計売上</th>
                    <th className="pb-2 pr-4 text-right">累計伝票</th>
                    <th className="pb-2 pr-4 text-right">累計客数</th>
                    <th className="pb-2 pr-4 text-right">営業日数</th>
                    <th className="pb-2 text-right">最終営業日</th>
                  </tr>
                </thead>
                <tbody>
                  {salesSummary.map(row => (
                    <tr key={row.store_id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-2 pr-4 font-medium text-white">{row.store_name}</td>
                      <td className="py-2 pr-4 text-right text-green-400 font-bold">{formatCurrency(row.lifetime_revenue)}</td>
                      <td className="py-2 pr-4 text-right">{Number(row.lifetime_slips).toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right">{Number(row.lifetime_customers).toLocaleString()}</td>
                      <td className="py-2 pr-4 text-right">{row.total_days_closed}日</td>
                      <td className="py-2 text-right text-gray-400">{formatDate(row.last_closed_date)}</td>
                    </tr>
                  ))}
                  {salesSummary.length === 0 && (
                    <tr><td colSpan={6} className="text-center text-gray-500 py-4">データなし</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── キャストタブ ── */}
        {tab === "casts" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mt-2">キャスト一覧 ({casts.filter(c => c.is_active).length}名 / 全{casts.length}名)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800 text-left">
                    <th className="pb-2 pr-3">店舗</th>
                    <th className="pb-2 pr-3">名前</th>
                    <th className="pb-2 pr-3">源氏名</th>
                    <th className="pb-2 pr-3 text-right">時給</th>
                    <th className="pb-2 pr-3 text-right">ドリンクバック</th>
                    <th className="pb-2 pr-3 text-right">指名バック</th>
                    <th className="pb-2 pr-3 text-right">同伴バック</th>
                    <th className="pb-2 pr-3 text-right">延長バック</th>
                    <th className="pb-2">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {casts.map(c => (
                    <tr key={c.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${!c.is_active ? "opacity-50" : ""}`}>
                      <td className="py-2 pr-3 text-gray-300">{c.store_name}</td>
                      <td className="py-2 pr-3 font-medium text-white">{c.name}</td>
                      <td className="py-2 pr-3 text-gray-400">{c.stage_name || "—"}</td>
                      <td className="py-2 pr-3 text-right">{formatCurrency(c.hourly_wage)}</td>
                      <td className="py-2 pr-3 text-right">{Number(c.drink_back_rate)}%</td>
                      <td className="py-2 pr-3 text-right">{Number(c.shimei_back_rate)}%</td>
                      <td className="py-2 pr-3 text-right">{Number(c.douhan_back_rate)}%</td>
                      <td className="py-2 pr-3 text-right">{Number(c.extension_back_rate)}%</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${c.is_active ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}>
                          {c.is_active ? "在籍" : "退籍"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {casts.length === 0 && (
                    <tr><td colSpan={9} className="text-center text-gray-500 py-4">データなし</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 商品タブ ── */}
        {tab === "products" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white mt-2">商品一覧 ({products.filter(p => p.is_active).length}件 / 全{products.length}件)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800 text-left">
                    <th className="pb-2 pr-4">店舗</th>
                    <th className="pb-2 pr-4">カテゴリ</th>
                    <th className="pb-2 pr-4">商品名</th>
                    <th className="pb-2 pr-4 text-right">単価</th>
                    <th className="pb-2">状態</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 ${!p.is_active ? "opacity-50" : ""}`}>
                      <td className="py-2 pr-4 text-gray-300">{p.store_name}</td>
                      <td className="py-2 pr-4 text-gray-400">{p.category_name || "—"}</td>
                      <td className="py-2 pr-4 font-medium text-white">{p.name}</td>
                      <td className="py-2 pr-4 text-right text-yellow-400 font-bold">{formatCurrency(p.price)}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${p.is_active ? "bg-green-900 text-green-300" : "bg-gray-800 text-gray-500"}`}>
                          {p.is_active ? "有効" : "無効"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr><td colSpan={5} className="text-center text-gray-500 py-4">データなし</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
