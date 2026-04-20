"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Plus, Table2, Clock, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import type { Table, Slip } from "@/types/database";

interface TableWithSlip extends Table {
  activeSlip?: Slip;
}

function elapsedMinutes(from: string): number {
  return Math.floor((Date.now() - new Date(from).getTime()) / 60000);
}

function remainingMinutes(from: string, limitMin: number): number {
  return limitMin - elapsedMinutes(from);
}

function formatMin(min: number): string {
  const sign = min < 0 ? "-" : "";
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return h > 0 ? `${sign}${h}h${String(m).padStart(2, "0")}m` : `${sign}${m}m`;
}

// 点滅タイマー表示コンポーネント（tickで親から1秒ごとに再描画）
function BlinkTimer({ min, colorClass, tick }: { min: number; colorClass: string; tick: number }) {
  // tickを使って偶数/奇数で点滅
  const blink = tick % 2 === 0;

  const isOver = min <= 0;
  const abs = Math.abs(min);
  const h = Math.floor(abs / 60);
  const m = abs % 60;

  return (
    <div className={`text-right shrink-0 ${colorClass}`}>
      <p className="text-[9px] font-medium leading-none mb-0.5 uppercase tracking-wide">
        {isOver ? "超過" : "残り"}
      </p>
      <p className="text-2xl font-bold leading-none tabular-nums">
        {isOver ? "-" : ""}
        {h > 0 ? `${h}` : ""}
        {h > 0
          ? <span style={{ opacity: blink ? 1 : 0.15 }}>:</span>
          : <span style={{ opacity: blink ? 1 : 0.3 }}>:</span>
        }
        {h > 0 ? String(m).padStart(2, "0") : String(m).padStart(2, "0")}
        <span className="text-base font-semibold ml-0.5">m</span>
      </p>
    </div>
  );
}

export default function TablesPage() {
  const { store, isAdmin, setStore } = useAuthStore();
  const [tables, setTables] = useState<TableWithSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [defaultTimerMin, setDefaultTimerMin] = useState(60);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const s = store?.settings as { timerEnabled?: boolean; defaultTimerMin?: number } | undefined;
    if (s) {
      // timerEnabledが明示的にfalseの場合のみ無効化（未設定=true）
      setTimerEnabled(s.timerEnabled !== false);
      setDefaultTimerMin(s.defaultTimerMin ?? 60);
    }
  }, [store?.settings]);

  const fetchTables = useCallback(async () => {
    if (!store?.id) return;
    try {
      const res = await fetch("/api/tables");
      if (!res.ok) throw new Error();
      const { tables: tablesData, openSlips } = await res.json();
      const slipMap: Record<string, Slip> = {};
      openSlips?.forEach((s: Slip) => { if (s.table_id) slipMap[s.table_id] = s; });
      // activeSlipがある卓はDBのstatusに関わらずoccupiedとして扱う
      setTables(tablesData.map((t: Table) => ({
        ...t,
        activeSlip: slipMap[t.id],
        status: slipMap[t.id] ? "occupied" : t.status,
      })));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [store?.id]);

  useEffect(() => {
    fetchTables();
    // データfetchは30秒ごと
    const fetchInterval = setInterval(() => fetchTables(), 30000);
    // tick（残り時間再計算）は1秒ごと
    const tickInterval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => {
      clearInterval(fetchInterval);
      clearInterval(tickInterval);
    };
  }, [fetchTables]);

  // タイマー超過通知
  useEffect(() => {
    if (!timerEnabled) return;
    tables.forEach((table) => {
      if (table.status !== "occupied" || !table.activeSlip) return;
      const startedAt = table.activeSlip.timer_started_at ?? table.activeSlip.opened_at;
      const remaining = remainingMinutes(startedAt, defaultTimerMin);
      if (remaining <= 0 && !notifiedRef.current.has(table.id)) {
        notifiedRef.current.add(table.id);
        toast(`⏰ ${table.name} のセット時間が終了しました`, {
          duration: 8000,
          style: { background: "#DF1B41", color: "white" },
        });
        if (Notification.permission === "granted") {
          new Notification(`${table.name} セット終了`, { body: "時間が来ました" });
        }
      }
      if ((table.status as string) === "empty") notifiedRef.current.delete(table.id);
    });
  }, [tick, tables, timerEnabled, defaultTimerMin]);

  async function archiveTable(tableId: string, tableName: string) {
    if (!confirm(`「${tableName}」の卓情報はなくなりますが宜しいですか？`)) return;
    try {
      const res = await fetch(`/api/tables?id=${tableId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${tableName}をアーカイブしました`);
      fetchTables();
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  async function addTable() {
    if (!store?.id) return;
    const name = prompt("卓名を入力（例：5卓、VIP2）");
    if (!name) return;
    try {
      // 重複名 → (2),(3)... でリネーム
      const existingNames = new Set(tables.map((t) => t.name));
      let finalName = name;
      let suffix = 2;
      while (existingNames.has(finalName)) {
        finalName = `${name}(${suffix})`;
        suffix++;
      }

      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalName,
          table_type: name.includes("VIP") || name.includes("vip") ? "vip" : "normal",
        }),
      });
      if (!res.ok) throw new Error();
      if (finalName !== name) {
        toast.success(`「${name}」は既存のため「${finalName}」として追加しました`);
      } else {
        toast.success(`${finalName}を追加しました`);
      }
      fetchTables();
    } catch {
      toast.error("作成失敗");
    }
  }

  async function saveTimerSettings() {
    try {
      if (timerEnabled && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      const existing = (store?.settings && typeof store.settings === "object" && !Array.isArray(store.settings))
        ? store.settings as Record<string, unknown>
        : {};
      const newSettings = { ...existing, timerEnabled, defaultTimerMin };
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("[saveTimerSettings] error:", errBody);
        throw new Error(errBody.detail ?? "保存失敗");
      }
      const updated = await res.json();
      setStore(updated);
      toast.success("タイマー設定を保存しました");
      setShowTimerSettings(false);
    } catch (e) {
      console.error("[saveTimerSettings] catch:", e);
      toast.error(`保存失敗: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-[#8792A2]">読み込み中...</div>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#3C4257]">卓管理</h1>
          <p className="text-sm text-[#8792A2]">{tables.filter((t) => t.status === "occupied").length} / {tables.length} 卓使用中</p>
        </div>
        <div className="flex gap-2">
          {isAdmin() && (
            <button onClick={() => setShowTimerSettings(true)}
              className="btn-secondary flex items-center gap-1.5 text-sm">
              <Settings2 className="w-4 h-4" />タイマー設定
            </button>
          )}
          {isAdmin() && (
            <button onClick={addTable} className="btn-primary flex items-center gap-1.5">
              <Plus className="w-4 h-4" />卓を追加
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {tables.map((table) => {
          const startedAt = table.activeSlip?.timer_started_at ?? table.activeSlip?.opened_at;
          const elapsed = startedAt ? elapsedMinutes(startedAt) : 0;
          const remaining = timerEnabled && startedAt ? remainingMinutes(startedAt, defaultTimerMin) : null;
          const isOver = remaining !== null && remaining <= 0;

          // 未確定金額 = slip.subtotal（slip_items合計、セット料金アイテム含む）
          // NeonのNUMERICは文字列で返るのでNumber()必須
          const pendingAmount = Number(table.activeSlip?.subtotal ?? 0);

          return (
            <div key={table.id} className="relative">
              {/* アーカイブボタン（管理者のみ・空席時のみ） */}
              {isAdmin() && table.status !== "occupied" && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); archiveTable(table.id, table.name); }}
                  className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 bg-gray-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow"
                  title="卓をアーカイブ">
                  ×
                </button>
              )}
            <Link
              href={table.activeSlip ? `/slips/${table.activeSlip.id}` : `/slips/new?tableId=${table.id}`}
              className={`block rounded-xl p-3 border-2 transition-all active:scale-95 ${
                isOver
                  ? "border-red-500 bg-red-50 shadow-lg"
                  : table.status === "occupied"
                  ? "border-[#FF2D78] bg-gradient-to-br from-pink-50 to-white"
                  : table.status === "reserved"
                  ? "border-amber-400 bg-amber-50"
                  : "border-[#E3E8EE] bg-white hover:border-[#FF2D78]"
              }`}>

              {/* タイプバッジ + ステータスドット */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                  table.table_type === "vip" ? "bg-yellow-100 text-yellow-700"
                  : table.table_type === "counter" ? "bg-gray-100 text-gray-600"
                  : "bg-blue-50 text-blue-600"
                }`}>
                  {table.table_type === "vip" ? "VIP" : table.table_type === "counter" ? "カウンター" : "通常"}
                </span>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isOver ? "bg-red-500 animate-ping"
                  : table.status === "occupied" ? "bg-[#FF2D78] animate-pulse"
                  : table.status === "reserved" ? "bg-amber-400" : "bg-gray-300"
                }`} />
              </div>

              {/* 卓名 */}
              <div className="flex items-center gap-1 mb-1">
                <Table2 className={`w-4 h-4 shrink-0 ${isOver ? "text-red-500" : table.status === "occupied" ? "text-[#FF2D78]" : "text-[#8792A2]"}`} />
                <p className={`font-bold text-base truncate ${isOver ? "text-red-600" : table.status === "occupied" ? "text-[#FF2D78]" : "text-[#3C4257]"}`}>
                  {table.name}
                </p>
              </div>

              {table.status === "occupied" && table.activeSlip ? (
                <>
                  {/* 未確定金額 */}
                  <p className="text-xs text-amber-600 font-semibold">
                    未確定 {formatCurrency(pendingAmount)}
                  </p>

                  {/* 下段：名前 + タイマー（大） */}
                  <div className="flex items-end justify-between mt-1 gap-1">
                    <div className="min-w-0">
                      {table.activeSlip.name && (
                        <p className="text-xs text-[#8792A2] truncate">{table.activeSlip.name}</p>
                      )}
                      {!timerEnabled && (
                        <div className="flex items-center gap-1 text-xs text-[#8792A2] mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatMin(elapsed)}</span>
                        </div>
                      )}
                    </div>

                    {/* 残り時間を右側に大きく */}
                    {timerEnabled && remaining !== null && (
                      <BlinkTimer
                        min={remaining}
                        colorClass={isOver ? "text-red-600" : remaining <= 10 ? "text-amber-500" : "text-[#FF2D78]"}
                        tick={tick}
                      />
                    )}
                  </div>
                </>
              ) : (
                <p className={`text-sm mt-2 ${table.status === "reserved" ? "text-amber-600 font-medium" : "text-[#8792A2]"}`}>
                  {table.status === "reserved" ? "予約中" : "空席 — タップして開始"}
                </p>
              )}
            </Link>
            </div>
          );
        })}
      </div>

      {/* タイマー設定モーダル — z-[60]でボトムナビより前面 */}
      {showTimerSettings && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowTimerSettings(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-2xl md:rounded-2xl p-6 shadow-2xl">
            <h2 className="font-semibold text-[#3C4257] mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF2D78]" />タイマー設定
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-[#3C4257]">タイマーを有効にする</p>
                  <p className="text-xs text-[#8792A2]">卓ごとにカウントダウンを表示・通知</p>
                </div>
                <div onClick={() => setTimerEnabled(!timerEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${timerEnabled ? "bg-[#FF2D78]" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${timerEnabled ? "translate-x-6" : "translate-x-0.5"}`} />
                </div>
              </label>

              {timerEnabled && (
                <div>
                  <label className="block text-xs text-[#8792A2] mb-1">デフォルトセット時間（分）</label>
                  <div className="flex items-center gap-3">
                    <input type="number" min={10} max={300} step={5}
                      className="input w-24 text-center text-lg font-bold"
                      value={defaultTimerMin}
                      onChange={(e) => setDefaultTimerMin(Number(e.target.value))} />
                    <div className="flex gap-1">
                      {[60, 90, 120].map((m) => (
                        <button key={m} onClick={() => setDefaultTimerMin(m)}
                          className={`px-2 py-1 rounded text-xs font-medium ${defaultTimerMin === m ? "bg-[#FF2D78] text-white" : "border border-[#E3E8EE] text-[#8792A2]"}`}>
                          {m}分
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#8792A2] mt-2">※ 時間超過時は卓の枠が赤くなり通知します。</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowTimerSettings(false)} className="btn-secondary flex-1">キャンセル</button>
              <button onClick={saveTimerSettings} className="btn-primary flex-1">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
