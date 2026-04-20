"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatDateTime, getTodayBusinessDate } from "@/lib/utils";
import Link from "next/link";
import { Plus, Search, FileText, AlertCircle, Calendar } from "lucide-react";
import type { Slip } from "@/types/database";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  open: { label: "営業中", class: "badge-warn" },
  closed: { label: "会計済", class: "badge-success" },
  locked: { label: "確定済", class: "badge-primary" },
  voided: { label: "取消", class: "badge-error" },
};

function getRetentionDays(plan: string | undefined): number {
  return plan === "premium" ? 30 : 3;
}

function getDateOptions(retentionDays: number): { label: string; value: string }[] {
  const options = [];
  const today = getTodayBusinessDate();
  for (let i = 0; i < retentionDays; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const val = d.toISOString().split("T")[0];
    const label = i === 0 ? "本日" : i === 1 ? "昨日" : `${val.slice(5).replace("-", "/")}`;
    options.push({ label, value: val });
  }
  return options;
}

export default function SlipsPage() {
  const { store } = useAuthStore();
  const retentionDays = getRetentionDays(store?.plan);
  const dateOptions = getDateOptions(retentionDays);

  const [selectedDate, setSelectedDate] = useState(getTodayBusinessDate());
  const [slips, setSlips] = useState<Slip[]>([]);
  const [filtered, setFiltered] = useState<Slip[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fetchSlips = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/slips?date=${selectedDate}`);
      if (!res.ok) throw new Error();
      const { slips: data } = await res.json();
      setSlips(data ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [store?.id, selectedDate]);

  useEffect(() => { fetchSlips(); }, [fetchSlips]);

  useEffect(() => {
    let result = slips;
    if (statusFilter !== "all") result = result.filter((s) => s.status === statusFilter);
    if (search) result = result.filter((s) => (s.name ?? "").includes(search) || s.slip_number.includes(search));
    setFiltered(result);
  }, [slips, statusFilter, search]);

  const slipLimit = store?.plan === "standard" ? (store.daily_slip_limit ?? 15) : Infinity;
  const closedToday = slips.filter((s) => s.status === "closed" || s.status === "locked").length;
  const limitReached = store?.plan === "standard" && closedToday >= slipLimit && selectedDate === getTodayBusinessDate();
  const isToday = selectedDate === getTodayBusinessDate();

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-[#3C4257]">伝票一覧</h1>
          <p className="text-sm text-[#8792A2]">
            {closedToday}枚完了{store?.plan === "standard" && isToday ? ` / ${slipLimit}枚` : ""}
            <span className="ml-1 text-xs">（{retentionDays}日間保存）</span>
          </p>
        </div>
        <Link href="/slips/new" className={cn("btn-primary flex items-center gap-1.5", limitReached && "opacity-40 pointer-events-none")}>
          <Plus className="w-4 h-4" />新規
        </Link>
      </div>

      {/* 日付セレクタ */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
        <Calendar className="w-4 h-4 text-[#8792A2] shrink-0" />
        {dateOptions.map((opt) => (
          <button key={opt.value} onClick={() => setSelectedDate(opt.value)}
            className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              selectedDate === opt.value ? "bg-[#FF2D78] text-white" : "bg-white border border-[#E3E8EE] text-[#8792A2]")}>
            {opt.label}
          </button>
        ))}
      </div>

      {limitReached && (
        <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">本日の上限に達しました。<Link href="/upgrade" className="underline">プレミアムへ</Link></p>
        </div>
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["all", "open", "closed", "locked"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              statusFilter === s ? "bg-[#FF2D78] text-white" : "bg-white border border-[#E3E8EE] text-[#8792A2]")}>
            {s === "all" ? "すべて" : STATUS_LABELS[s]?.label}
          </button>
        ))}
        <div className="relative ml-auto shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8792A2]" />
          <input className="input pl-8 py-1.5 text-xs w-36" placeholder="伝票名・番号"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-[#8792A2]">読み込み中...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#8792A2]">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>伝票がありません</p>
          {isToday && <Link href="/slips/new" className="mt-2 inline-block text-sm text-[#FF2D78]">最初の伝票を作成</Link>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((slip) => {
            const { label, class: cls } = STATUS_LABELS[slip.status] ?? { label: slip.status, class: "badge-primary" };
            return (
              <Link key={slip.id} href={`/slips/${slip.id}`}
                className="card flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.99]">
                <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#FF2D78]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#3C4257] text-sm truncate">{slip.name || slip.slip_number}</p>
                  <p className="text-xs text-[#8792A2]">{formatDateTime(slip.opened_at)} | #{slip.slip_number}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[#3C4257] text-sm">{formatCurrency(slip.total_amount)}</p>
                  <span className={cls}>{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
