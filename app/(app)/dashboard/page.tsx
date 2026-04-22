"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDateTime, getTodayBusinessDate } from "@/lib/utils";
import Link from "next/link";
import { FileText, TrendingUp, Clock, Table2, Plus, RefreshCw, AlertCircle, CheckCircle, HelpCircle, X, MessageSquarePlus, Send, ChevronDown } from "lucide-react";
import ShineBanner from "@/components/ShineBanner";
import toast from "react-hot-toast";
import type { Slip, Table } from "@/types/database";

// ─── FeedbackForm コンポーネント ─────────────────────────────────
const CATEGORIES = ["改善要望", "新機能の提案", "バグ・不具合", "操作に関する質問", "その他"];

function FeedbackForm() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) { toast.error("内容を入力してください"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "送信に失敗しました");
      }
      setSent(true);
      setMessage("");
      toast.success("フィードバックを送信しました。ご協力ありがとうございます！");
      setTimeout(() => { setSent(false); setOpen(false); }, 2500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "送信に失敗しました");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-[#FF2D78]/40 bg-pink-50/50 hover:bg-pink-50 transition-colors text-sm text-[#FF2D78] font-medium"
      >
        <span className="flex items-center gap-2">
          <MessageSquarePlus className="w-4 h-4" />
          改善のご意見・バグ報告はこちらから
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-2 p-4 rounded-xl border border-[#E3E8EE] bg-white shadow-sm">
          {sent ? (
            <div className="text-center py-6">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-[#3C4257]">送信しました！</p>
              <p className="text-xs text-[#8792A2] mt-1">ご登録メールアドレスに確認メールをお送りしました。</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="text-xs text-[#8792A2] mb-3">
                機能改善・新機能のご提案・バグやトラブルなど、お気軽にお知らせください。<br />
                送信内容はご登録のメールアドレスにも控えが届きます。
              </p>
              <div className="mb-3">
                <label className="block text-xs font-medium text-[#3C4257] mb-1">カテゴリ</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-[#E3E8EE] rounded-lg px-3 py-2 text-sm text-[#3C4257] focus:outline-none focus:ring-2 focus:ring-[#FF2D78]/30 focus:border-[#FF2D78]"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-[#3C4257] mb-1">内容 <span className="text-[#FF2D78]">*</span></label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="例：〇〇の画面で△△ができると便利だと思います。&#10;例：〇〇ボタンを押すとエラーが表示されます。"
                  maxLength={2000}
                  rows={5}
                  className="w-full border border-[#E3E8EE] rounded-lg px-3 py-2 text-sm text-[#3C4257] resize-none focus:outline-none focus:ring-2 focus:ring-[#FF2D78]/30 focus:border-[#FF2D78] placeholder-[#C4CACD]"
                />
                <p className="text-right text-xs text-[#C4CACD] mt-0.5">{message.length}/2000</p>
              </div>
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FF2D78] text-white text-sm font-medium hover:bg-[#e01f66] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? "送信中..." : "送信する"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tip コンポーネント ───────────────────────────────────────────
function Tip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative inline-flex items-center" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-[#C4CACD] hover:text-[#8792A2] transition-colors ml-1"
        aria-label="ヘルプ"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute z-[70] top-6 left-1/2 -translate-x-1/2 w-64 bg-[#0A2540] text-white text-xs rounded-xl shadow-xl p-3 leading-relaxed">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-2 right-2 text-white/50 hover:text-white"
          >
            <X className="w-3 h-3" />
          </button>
          {children}
          {/* 吹き出し三角 */}
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0A2540] rotate-45 rounded-sm" />
        </div>
      )}
    </div>
  );
}

interface DashboardStats {
  todaySlips: number;
  confirmedRevenue: number;   // 会計済み（closed/locked）
  pendingRevenue: number;     // 営業中（open）の小計合計
  openSlips: number;
  occupiedTables: number;
}

export default function DashboardPage() {
  const { store, storeUser, isAdmin, isPremium } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({ todaySlips: 0, confirmedRevenue: 0, pendingRevenue: 0, openSlips: 0, occupiedTables: 0 });
  const [openSlips, setOpenSlips] = useState<Slip[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!store?.id) return;
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error();
      const { slips, tables: tablesData, isClosed } = await res.json();

      // 営業終了済みなら¥0固定表示
      if (isClosed) {
        setStats({ todaySlips: 0, confirmedRevenue: 0, pendingRevenue: 0, openSlips: 0, occupiedTables: 0 });
        setOpenSlips([]);
        setTables(tablesData);
        return;
      }

      const closedSlips = slips.filter((s: Slip) => s.status === "closed" || s.status === "locked");
      const openSlipsList = slips.filter((s: Slip) => s.status === "open");

      setStats({
        todaySlips: closedSlips.length,
        // DBのNUMERIC型は文字列で返ることがあるのでNumber()で変換
        confirmedRevenue: closedSlips.reduce((sum: number, s: Slip) => sum + Number(s.total_amount ?? 0), 0),
        pendingRevenue: openSlipsList.reduce((sum: number, s: Slip) => sum + Number(s.subtotal ?? 0), 0),
        openSlips: openSlipsList.length,
        occupiedTables: tablesData.filter((t: Table) => t.status === "occupied").length,
      });
      setOpenSlips(openSlipsList);
      setTables(tablesData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleCloseDay() {
    if (!store?.id || !storeUser?.id) return;
    const openCount = stats.openSlips;
    const resetNote = store?.plan === "standard"
      ? "\n\n※ 無料プランの伝票枚数カウント（1日15枚）は翌日AM3:00にリセットされます。"
      : "";
    const confirmMsg = openCount > 0
      ? `営業中の伝票が${openCount}件あります。全て自動会計して営業を終了しますか？${resetNote}`
      : `本日の営業を終了しますか？${resetNote}`;
    if (!confirm(confirmMsg)) return;
    setClosing(true);
    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? "処理に失敗しました");
      }
      const { totalRevenue, autoClosedCount } = await res.json();
      const resultMsg = autoClosedCount > 0
        ? `営業終了。${autoClosedCount}件を自動会計。確定売上：${formatCurrency(totalRevenue)}`
        : `営業終了完了。確定売上：${formatCurrency(totalRevenue)}`;
      toast.success(resultMsg, { duration: 6000 });
      // 画面をリセット（翌営業に向けて0表示）
      setStats({ todaySlips: 0, confirmedRevenue: 0, pendingRevenue: 0, openSlips: 0, occupiedTables: 0 });
      setOpenSlips([]);
      setTables((prev) => prev.map((t) => ({ ...t, status: "empty" as const })));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "処理に失敗しました");
    } finally {
      setClosing(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-6 h-6 animate-spin text-[#FF2D78]" />
    </div>
  );

  const slipLimit = store?.plan === "standard" ? store.daily_slip_limit ?? 15 : Infinity;
  const slipLimitReached = store?.plan === "standard" && stats.todaySlips >= slipLimit;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-semibold text-[#3C4257]">ダッシュボード</h1>
            <Tip>
              <p className="font-semibold mb-1">📊 ダッシュボードとは</p>
              本日の営業状況をリアルタイムで確認できる画面です。<br />
              売上・伝票・卓の状況をひと目で把握できます。<br /><br />
              <span className="text-white/70">🔄 更新ボタンで最新データを取得できます。</span>
            </Tip>
          </div>
          <p className="text-sm text-[#8792A2]">{new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={fetchData} className="btn-secondary p-2.5" title="最新データに更新"><RefreshCw className="w-4 h-4" /></button>
          {isAdmin() && (
            <div className="flex items-center gap-1">
              <button onClick={handleCloseDay} disabled={closing}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#7B0032] text-white text-sm font-medium rounded transition-colors hover:bg-[#9B0040] active:scale-95">
                <CheckCircle className="w-4 h-4" />
                {closing ? "処理中..." : "営業終了"}
              </button>
              <Tip>
                <p className="font-semibold mb-1">🔒 営業終了とは</p>
                1日の営業を締める操作です。<br /><br />
                <span className="text-amber-300">⚠️ 実行すると：</span><br />
                • 営業中の伝票を全て自動会計<br />
                • 本日の売上を確定・保存<br />
                • 卓を全て空席に戻す<br /><br />
                <span className="text-white/70">管理者のみ実行できます。</span>
              </Tip>
            </div>
          )}
        </div>
      </div>

      {slipLimitReached && (
        <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700">本日の伝票上限（{slipLimit}枚）に達しました</p>
            <Link href="/upgrade" className="text-xs text-amber-600 underline">プレミアムにアップグレード →</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {/* 売上カード */}
        <div className="card col-span-2 md:col-span-1">
          <div className="flex items-start justify-between">
            <div className="inline-flex p-2 rounded-lg bg-pink-50 mb-2"><TrendingUp className="w-4 h-4 text-pink-600" /></div>
            <Tip>
              <p className="font-semibold mb-1">💰 本日売上について</p>
              <span className="text-amber-300">未確定（オレンジ）</span>：現在営業中の伝票の小計合計。会計前の見込み額です。<br /><br />
              <span className="text-pink-300">確定済み（ピンク）</span>：会計済み・ロック済み伝票の合計。実際に確定した売上です。<br /><br />
              <span className="text-white/70">※ 営業終了を実行すると全伝票が確定売上に移行します。</span>
            </Tip>
          </div>
          <p className="text-xs text-[#8792A2]">本日売上</p>
          {stats.pendingRevenue > 0 && (
            <p className="text-sm font-semibold text-amber-500 mt-0.5">
              {formatCurrency(stats.pendingRevenue)} <span className="text-xs font-normal">未確定</span>
            </p>
          )}
          <p className="text-2xl font-bold text-pink-600 mt-0.5">{formatCurrency(stats.confirmedRevenue)}</p>
          <p className="text-xs text-[#8792A2] mt-0.5">確定済み</p>
        </div>

        {/* 伝票枚数カード */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div className="inline-flex p-2 rounded-lg bg-blue-50 mb-2"><FileText className="w-4 h-4 text-blue-600" /></div>
            <Tip>
              <p className="font-semibold mb-1">🗒️ 伝票枚数とは</p>
              本日（AM3:00基準）に会計済みになった伝票の枚数です。<br /><br />
              <span className="text-white/70">無料プランは1日15枚まで。上限に達すると新規作成できません。</span><br /><br />
              カウントはAM3:00にリセットされます（夜間営業対応）。
            </Tip>
          </div>
          <p className="text-xs text-[#8792A2]">伝票枚数</p>
          <p className="text-xl font-bold text-[#3C4257] mt-0.5">{stats.todaySlips}枚</p>
          {store?.plan === "standard" && (
            <p className="text-xs text-[#8792A2] mt-0.5">上限 {store.daily_slip_limit ?? 15}枚</p>
          )}
        </div>

        {/* 営業中伝票カード */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div className="inline-flex p-2 rounded-lg bg-amber-50 mb-2"><Clock className="w-4 h-4 text-amber-600" /></div>
            <Tip>
              <p className="font-semibold mb-1">⏱️ 営業中伝票とは</p>
              現在「会計前」のお客様の伝票数です。<br /><br />
              タップすると伝票詳細へ移動し、商品追加・会計ができます。<br /><br />
              <span className="text-white/70">営業終了ボタンで全件を一括自動会計できます。</span>
            </Tip>
          </div>
          <p className="text-xs text-[#8792A2]">営業中伝票</p>
          <p className="text-xl font-bold text-[#3C4257] mt-0.5">{stats.openSlips}件</p>
        </div>

        {/* 使用中卓カード */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div className="inline-flex p-2 rounded-lg bg-emerald-50 mb-2"><Table2 className="w-4 h-4 text-emerald-600" /></div>
            <Tip>
              <p className="font-semibold mb-1">🪑 使用中卓とは</p>
              現在「使用中」ステータスの卓数です。<br /><br />
              卓管理画面でステータスの変更・タイマーの確認ができます。<br /><br />
              <span className="text-white/70">卓を追加・削除するには設定 → 卓管理へ。</span>
            </Tip>
          </div>
          <p className="text-xs text-[#8792A2]">使用中卓</p>
          <p className="text-xl font-bold text-[#3C4257] mt-0.5">{stats.occupiedTables}卓</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <h2 className="font-semibold text-[#3C4257] text-sm">営業中の伝票</h2>
              <Tip>
                <p className="font-semibold mb-1">🗒️ 伝票の使い方</p>
                お客様ごとに1枚作成します。<br /><br />
                <span className="text-white/80">① 「新規」→ 卓・名前・セット料金を入力</span><br />
                <span className="text-white/80">② 伝票をタップ → 商品追加・延長追加</span><br />
                <span className="text-white/80">③ 「会計」ボタンで締め</span><br /><br />
                指名・同伴・延長料金はキャスト管理のバック計算に自動反映されます。
              </Tip>
            </div>
            <Link href="/slips/new" className={`flex items-center gap-1 text-xs ${slipLimitReached ? "opacity-40 pointer-events-none" : "text-[#FF2D78]"}`}>
              <Plus className="w-3.5 h-3.5" />新規
            </Link>
          </div>
          {openSlips.length === 0 ? (
            <div className="text-center py-8 text-[#8792A2]">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">営業中の伝票はありません</p>
              <Link href="/slips/new" className="mt-2 inline-block text-xs text-[#FF2D78]">新しい伝票を作成</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {openSlips.slice(0, 5).map((slip) => (
                <Link key={slip.id} href={`/slips/${slip.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-[#E3E8EE] hover:border-[#FF2D78] transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#3C4257]">{slip.name || slip.slip_number}</p>
                    <p className="text-xs text-[#8792A2]">{formatDateTime(slip.opened_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#FF2D78]">{formatCurrency(slip.total_amount)}</p>
                    <span className="badge-warn text-xs">営業中</span>
                  </div>
                </Link>
              ))}
              {openSlips.length > 5 && (
                <Link href="/slips" className="block text-center text-xs text-[#FF2D78] py-1">他 {openSlips.length - 5} 件を表示</Link>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <h2 className="font-semibold text-[#3C4257] text-sm">卓状況</h2>
              <Tip>
                <p className="font-semibold mb-1">🪑 卓ステータスの見方</p>
                <span className="text-pink-300">■ ピンク（使用中）</span>：お客様が在席中<br />
                <span className="text-amber-300">■ オレンジ（予約）</span>：予約済みの卓<br />
                <span className="text-white/60">■ グレー（空席）</span>：利用可能な卓<br /><br />
                「詳細」リンクから卓管理画面へ移動できます。タイマーの確認・リセットも可能です。<br /><br />
                <span className="text-white/70">卓の追加・削除は卓管理画面から行えます。</span>
              </Tip>
            </div>
            <Link href="/tables" className="text-xs text-[#FF2D78]">詳細</Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {tables.map((table) => (
              <Link key={table.id} href={`/tables`}
                className={`rounded-xl p-3 text-center border-2 transition-colors ${
                  table.status === "occupied" ? "border-[#FF2D78] bg-pink-50"
                  : table.status === "reserved" ? "border-amber-400 bg-amber-50"
                  : "border-[#E3E8EE] bg-white hover:border-[#FF2D78]"
                }`}>
                <p className={`font-bold text-sm ${table.status === "occupied" ? "text-[#FF2D78]" : "text-[#3C4257]"}`}>{table.name}</p>
                <p className={`text-xs mt-0.5 ${table.status === "occupied" ? "text-pink-600" : table.status === "reserved" ? "text-amber-600" : "text-[#8792A2]"}`}>
                  {table.status === "occupied" ? "使用中" : table.status === "reserved" ? "予約" : "空席"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* フィードバックフォーム */}
      <FeedbackForm />

      {/* Shine バナー */}
      <ShineBanner />

      {/* フッター：法的リンク */}
      <footer className="mt-8 pb-24 text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-[#C4CACD]">
          <Link href="/privacy" className="hover:text-[#FF2D78] transition-colors">プライバシーポリシー</Link>
          <span>|</span>
          <Link href="/terms" className="hover:text-[#FF2D78] transition-colors">利用規約</Link>
          <span>|</span>
          <Link href="/tokushoho" className="hover:text-[#FF2D78] transition-colors">特定商取引法に基づく表記</Link>
        </div>
        <p className="text-[10px] text-[#C4CACD] mt-2">© 2025 水商売伝票SaaS All rights reserved.</p>
      </footer>
    </div>
  );
}
