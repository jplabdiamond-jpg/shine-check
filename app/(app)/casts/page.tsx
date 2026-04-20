"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { Plus, Crown, Users, TrendingUp, Edit2, Trash2, Clock, LogIn, CheckCircle2, XCircle } from "lucide-react";
import ShineBanner from "@/components/ShineBanner";
import toast from "react-hot-toast";
import type { Cast } from "@/types/database";
import Link from "next/link";
import { cn } from "@/lib/utils";

// DB実態に合わせた拡張型
interface CastWithLogin extends Cast {
  login_email?: string | null;
}

interface CastToday {
  id: string; name: string; stage_name: string | null;
  drink_back_rate: number; shimei_back_rate: number; douhan_back_rate: number; extension_back_rate: number;
  hourly_wage: number;
  today_checkin_at: string | null; today_checkout_at: string | null;
  drink_total: number; shimei_total: number; douhan_total: number; extension_total: number;
  slip_count: number;
}

type Tab = "list" | "today" | "sales";

const emptyForm = {
  name: "", stage_name: "", drink_back_rate: "20", shimei_back_rate: "30",
  douhan_back_rate: "50", extension_back_rate: "30", hourly_wage: "0",
  login_email: "", login_password: "",
};

export default function CastsPage() {
  const { store, isPremium, isAdmin } = useAuthStore();
  const [tab, setTab] = useState<Tab>("list");
  const [casts, setCasts] = useState<CastWithLogin[]>([]);
  const [todayData, setTodayData] = useState<CastToday[]>([]);
  const [castSales, setCastSales] = useState<CastToday[]>([]);
  const [salesPeriod, setSalesPeriod] = useState(30);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CastWithLogin | null>(null);
  const [form, setForm] = useState(emptyForm);
  // 出勤設定
  const [showCheckin, setShowCheckin] = useState<string | null>(null);
  const [checkinTime, setCheckinTime] = useState("");
  const [checkoutTime, setCheckoutTime] = useState("");

  const fetchCasts = useCallback(async () => {
    if (!store?.id) return;
    try {
      const res = await fetch("/api/casts");
      if (!res.ok) throw new Error();
      const { casts: data } = await res.json();
      setCasts(data ?? []);
    } catch (err) {
      console.error("[fetchCasts]", err);
    }
  }, [store?.id]);

  const fetchToday = useCallback(async () => {
    if (!store?.id) return;
    try {
      const res = await fetch("/api/casts/today");
      if (!res.ok) throw new Error();
      const { castSales: data } = await res.json();
      setTodayData(data ?? []);
    } catch { /* silent */ }
  }, [store?.id]);

  const fetchSales = useCallback(async () => {
    if (!store?.id) return;
    try {
      const res = await fetch(`/api/casts/sales?days=${salesPeriod}`);
      if (!res.ok) throw new Error();
      const { castSales: data } = await res.json();
      setCastSales(data ?? []);
    } catch { /* silent */ }
  }, [store?.id, salesPeriod]);

  useEffect(() => { fetchCasts(); }, [fetchCasts]);
  useEffect(() => { if (tab === "today") fetchToday(); }, [tab, fetchToday]);
  useEffect(() => { if (tab === "sales") fetchSales(); }, [tab, fetchSales]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(c: CastWithLogin) {
    setEditing(c);
    setForm({
      name: c.name, stage_name: c.stage_name ?? "",
      drink_back_rate: String(c.drink_back_rate),
      shimei_back_rate: String(c.shimei_back_rate),
      douhan_back_rate: String(c.douhan_back_rate),
      extension_back_rate: String(c.extension_back_rate ?? 30),
      hourly_wage: String(c.hourly_wage),
      login_email: c.login_email ?? "",
      login_password: "",
    });
    setShowModal(true);
  }

  async function save() {
    if (!form.name) { toast.error("名前は必須です"); return; }
    try {
      const payload = {
        name: form.name, stage_name: form.stage_name || null,
        drink_back_rate: Number(form.drink_back_rate),
        shimei_back_rate: Number(form.shimei_back_rate),
        douhan_back_rate: Number(form.douhan_back_rate),
        extension_back_rate: Number(form.extension_back_rate),
        hourly_wage: Number(form.hourly_wage),
        login_email: form.login_email || null,
        login_password: form.login_password || null,
      };
      const res = await fetch("/api/casts", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...payload, id: editing.id } : payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        toast.error(d.error ?? "保存失敗");
        return;
      }
      toast.success(editing ? "更新しました" : "追加しました");
      setShowModal(false);
      fetchCasts();
    } catch {
      toast.error(editing ? "更新失敗" : "追加失敗");
    }
  }

  async function deleteCast(c: CastWithLogin) {
    if (!confirm(`${c.stage_name || c.name}を削除しますか？`)) return;
    try {
      await fetch("/api/casts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: c.id }) });
      toast.success("削除しました");
      fetchCasts();
    } catch { toast.error("削除失敗"); }
  }

  async function handleCheckin(castId: string) {
    try {
      const res = await fetch("/api/casts/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          castId,
          action: "checkin",
          checkinTime: checkinTime || null,
          checkoutTime: checkoutTime || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success(checkoutTime ? "出退勤を登録しました" : "出勤打刻しました");
      setShowCheckin(null);
      setCheckinTime("");
      setCheckoutTime("");
      fetchCasts();
      if (tab === "today") fetchToday();
    } catch { toast.error("打刻失敗"); }
  }

  async function handleCheckout(castId: string) {
    try {
      await fetch("/api/casts/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ castId, action: "checkout" }),
      });
      toast.success("退勤打刻しました");
      fetchCasts();
      if (tab === "today") fetchToday();
    } catch { toast.error("打刻失敗"); }
  }

  async function handleResetAttendance(castId: string) {
    try {
      const res = await fetch("/api/casts/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ castId, action: "reset" }),
      });
      if (!res.ok) throw new Error();
      toast("出勤情報をリセットしました");
      await fetchCasts();
      if (tab === "today") await fetchToday();
    } catch { toast.error("リセット失敗"); }
  }

  // 実働分数（生の経過時間）
  function calcWorkedMinutes(checkin: string | null, checkout: string | null): number {
    if (!checkin) return 0;
    const start = new Date(checkin).getTime();
    const end = checkout ? new Date(checkout).getTime() : Date.now();
    return Math.max(0, Math.floor((end - start) / 60000));
  }

  // 時給計算に使う有効単位分数
  // ルール: 単位の端数が15分以下→切り捨て、16分以上→次単位繰り上げ
  function calcWageMinutes(workedMin: number): number {
    const s = (store?.settings ?? {}) as { wageUnitMinutes?: 30 | 60 };
    const unit = s.wageUnitMinutes ?? 60;
    const base = Math.floor(workedMin / unit) * unit; // 切り捨て済み単位分数
    const remainder = workedMin - base;               // 端数（分）
    return remainder >= 16 ? base + unit : base;
  }

  function formatWorkedTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}時間${m}分` : `${m}分`;
  }

  function formatTime(isoStr: string | null): string {
    if (!isoStr) return "—";
    const d = new Date(isoStr);
    const jst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
    return `${String(jst.getUTCHours()).padStart(2, "0")}:${String(jst.getUTCMinutes()).padStart(2, "0")}`;
  }

  if (!isPremium()) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Crown className="w-12 h-12 text-yellow-400 mb-3" />
        <h2 className="text-xl font-bold text-[#3C4257] mb-2">プレミアム機能</h2>
        <p className="text-[#8792A2] text-sm mb-4">キャスト管理はプレミアムプランでご利用いただけます</p>
        <Link href="/upgrade" className="btn-primary">プレミアムにアップグレード</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#3C4257]">キャスト管理</h1>
        {isAdmin() && tab === "list" && (
          <button onClick={openNew} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" />追加
          </button>
        )}
      </div>

      {/* タブ */}
      <div className="flex gap-1 mb-4 bg-[#F6F9FC] rounded-lg p-1">
        {(["list", "today", "sales"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("flex-1 py-2 rounded-md text-xs font-medium transition-colors",
              tab === t ? "bg-white text-[#FF2D78] shadow-sm" : "text-[#8792A2]")}>
            {t === "list" ? "キャスト一覧" : t === "today" ? "本日集計" : "期間集計"}
          </button>
        ))}
      </div>

      {/* ===== キャスト一覧タブ ===== */}
      {tab === "list" && (
        <>
          {casts.length === 0 ? (
            <div className="text-center py-16 text-[#8792A2]">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>キャストを追加してください</p>
            </div>
          ) : (
            <div className="space-y-3">
              {casts.map((cast) => {
                const workedMin = calcWorkedMinutes(cast.today_checkin_at, cast.today_checkout_at);
                const hourlyWage = Number(cast.hourly_wage ?? 0);
                const wageMin = calcWageMinutes(workedMin);
                const todayWage = Math.floor(wageMin / 60 * hourlyWage);
                const isCheckedIn = !!cast.today_checkin_at;
                const isCheckedOut = !!cast.today_checkout_at;

                return (
                  <div key={cast.id} className="card">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold">{(cast.stage_name || cast.name)[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#3C4257]">{cast.stage_name || cast.name}</p>
                        {cast.stage_name && <p className="text-xs text-[#8792A2]">{cast.name}</p>}
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded">飲み {cast.drink_back_rate}%</span>
                          <span className="text-xs bg-pink-50 text-pink-600 px-2 py-0.5 rounded">指名 {cast.shimei_back_rate}%</span>
                          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded">同伴 {cast.douhan_back_rate}%</span>
                          {hourlyWage > 0 && <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded">時給 {formatCurrency(hourlyWage)}</span>}
                          {cast.login_email && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center gap-0.5"><LogIn className="w-3 h-3" />ログイン可</span>}
                        </div>
                      </div>
                      {isAdmin() && (
                        <div className="flex flex-col gap-1 shrink-0">
                          <button onClick={() => openEdit(cast)} className="p-1.5 rounded hover:bg-[#F6F9FC]">
                            <Edit2 className="w-4 h-4 text-[#8792A2]" />
                          </button>
                          <button onClick={() => deleteCast(cast)} className="p-1.5 rounded hover:bg-red-50">
                            <Trash2 className="w-4 h-4 text-[#DF1B41]" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 出勤情報 */}
                    <div className="mt-3 pt-3 border-t border-[#E3E8EE] flex items-center gap-2 flex-wrap">
                      {!isCheckedIn ? (
                        <>
                          {showCheckin === cast.id ? (
                            <div className="flex flex-col gap-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-emerald-700 w-14 shrink-0">出勤時間</span>
                                <input type="time" className="input text-sm py-1 flex-1"
                                  value={checkinTime} onChange={(e) => setCheckinTime(e.target.value)} />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#A07090] w-14 shrink-0">退勤時間</span>
                                <input type="time" className="input text-sm py-1 flex-1"
                                  value={checkoutTime} onChange={(e) => setCheckoutTime(e.target.value)} />
                                <span className="text-xs text-[#A07090]">任意</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleCheckin(cast.id)}
                                  className="btn-primary text-xs px-4 py-1.5 flex-1">打刻</button>
                                <button onClick={() => { setShowCheckin(null); setCheckinTime(""); setCheckoutTime(""); }}
                                  className="btn-secondary text-xs px-3 py-1.5">×</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setShowCheckin(cast.id); setCheckinTime(""); setCheckoutTime(""); }}
                              className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 transition-colors">
                              <Clock className="w-3.5 h-3.5" />本日出勤
                            </button>
                          )}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {formatTime(cast.today_checkin_at)} 出勤
                            {isCheckedOut && ` → ${formatTime(cast.today_checkout_at)} 退勤`}
                          </div>
                          <button onClick={() => handleCheckout(cast.id)}
                            className="flex items-center gap-1 text-xs bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            <XCircle className="w-3.5 h-3.5" />{isCheckedOut ? "退勤修正" : "退勤"}
                          </button>
                          {hourlyWage > 0 && (
                            <span className="text-xs text-[#8792A2]">
                              実働 {formatWorkedTime(workedMin)}（計算 {formatWorkedTime(wageMin)}）/ 本日時給 <strong className="text-[#3C4257]">{formatCurrency(todayWage)}</strong>
                            </span>
                          )}
                          <button onClick={() => handleResetAttendance(cast.id)}
                            className="text-xs text-[#8792A2] underline ml-auto">リセット</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ===== 本日集計タブ ===== */}
      {tab === "today" && (
        <>
          <div className="flex justify-end mb-3">
            <button onClick={fetchToday} className="text-xs text-[#FF2D78] hover:underline">更新</button>
          </div>
          {todayData.length === 0 ? (
            <div className="text-center py-16 text-[#8792A2]">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>データがありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* 合計行 */}
              {(() => {
                const totalBack = todayData.reduce((sum, cs) => {
                  const d = Math.floor(Number(cs.drink_total) * Number(cs.drink_back_rate) / 100);
                  const s = Math.floor(Number(cs.shimei_total) * Number(cs.shimei_back_rate) / 100);
                  const do_ = Math.floor(Number(cs.douhan_total) * Number(cs.douhan_back_rate) / 100);
                  const e = Math.floor(Number(cs.extension_total) * Number(cs.extension_back_rate) / 100);
                  return sum + d + s + do_ + e;
                }, 0);
                const totalWage = todayData.reduce((sum, cs) => {
                  const min = calcWorkedMinutes(cs.today_checkin_at, cs.today_checkout_at);
                  return sum + Math.floor(calcWageMinutes(min) / 60 * Number(cs.hourly_wage));
                }, 0);
                return (
                  <div className="card bg-gradient-to-r from-pink-50 to-blue-50 border-pink-100">
                    <p className="text-xs font-medium text-pink-600 mb-2">本日 人件費サマリー</p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div><p className="text-xs text-[#8792A2]">バック合計</p><p className="font-bold text-[#FF2D78]">{formatCurrency(totalBack)}</p></div>
                      <div><p className="text-xs text-[#8792A2]">時給合計</p><p className="font-bold text-emerald-600">{formatCurrency(totalWage)}</p></div>
                      <div><p className="text-xs text-[#8792A2]">人件費合計</p><p className="font-bold text-[#3C4257] text-lg">{formatCurrency(totalBack + totalWage)}</p></div>
                    </div>
                  </div>
                );
              })()}

              {todayData.map((cs) => {
                const drinkBack = Math.floor(Number(cs.drink_total) * Number(cs.drink_back_rate) / 100);
                const shimeiBack = Math.floor(Number(cs.shimei_total) * Number(cs.shimei_back_rate) / 100);
                const douhanBack = Math.floor(Number(cs.douhan_total) * Number(cs.douhan_back_rate) / 100);
                const extBack = Math.floor(Number(cs.extension_total) * Number(cs.extension_back_rate) / 100);
                const totalBack = drinkBack + shimeiBack + douhanBack + extBack;
                const workedMin = calcWorkedMinutes(cs.today_checkin_at, cs.today_checkout_at);
                const wageMin = calcWageMinutes(workedMin);
                const todayWage = Math.floor(wageMin / 60 * Number(cs.hourly_wage));
                const totalLabor = totalBack + todayWage;

                return (
                  <div key={cs.id} className="card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">{(cs.stage_name || cs.name)[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#3C4257]">{cs.stage_name || cs.name}</p>
                        <p className="text-xs text-[#8792A2]">
                          {cs.today_checkin_at
                            ? `${formatTime(cs.today_checkin_at)} 出勤${cs.today_checkout_at ? ` → ${formatTime(cs.today_checkout_at)} 退勤` : "（出勤中）"} / ${formatWorkedTime(workedMin)}`
                            : "未出勤"}
                        </p>
                      </div>
                      {/* 人件費合計（右端） */}
                      <div className="text-right shrink-0">
                        <p className="text-xs text-[#8792A2]">人件費合計</p>
                        <p className="text-lg font-bold text-[#3C4257]">{formatCurrency(totalLabor)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pt-2 border-t border-[#E3E8EE]">
                      <div className="flex justify-between">
                        <span className="text-pink-600">飲みバック ({cs.drink_back_rate}%)</span>
                        <span className="font-medium">{formatCurrency(drinkBack)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-pink-600">指名バック ({cs.shimei_back_rate}%)</span>
                        <span className="font-medium">{formatCurrency(shimeiBack)}</span>
                      </div>
                      {Number(cs.douhan_total) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-amber-600">同伴バック ({cs.douhan_back_rate}%)</span>
                          <span className="font-medium">{formatCurrency(douhanBack)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-[#FF2D78]">
                        <span>バック小計</span>
                        <span>{formatCurrency(totalBack)}</span>
                      </div>
                      {Number(cs.hourly_wage) > 0 && (
                        <div className="flex justify-between text-emerald-600 col-span-2">
                          <span>キャスト時給（実働 {formatWorkedTime(workedMin)} → 計算 {formatWorkedTime(wageMin)}）</span>
                          <span className="font-medium">{formatCurrency(todayWage)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ===== 期間集計タブ ===== */}
      {tab === "sales" && (
        <>
          <div className="flex gap-1 mb-4 justify-end">
            {[7, 14, 30].map((d) => (
              <button key={d} onClick={() => setSalesPeriod(d)}
                className={cn("px-3 py-1.5 rounded text-xs font-medium transition-colors",
                  salesPeriod === d ? "bg-[#FF2D78] text-white" : "bg-white border border-[#E3E8EE] text-[#8792A2]")}>
                {d}日
              </button>
            ))}
          </div>
          {castSales.length === 0 ? (
            <div className="text-center py-16 text-[#8792A2]">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>データがありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {castSales.map((cs) => {
                const drinkBack = Math.floor(Number(cs.drink_total) * Number(cs.drink_back_rate) / 100);
                const shimeiBack = Math.floor(Number(cs.shimei_total) * Number(cs.shimei_back_rate) / 100);
                const douhanBack = Math.floor(Number(cs.douhan_total) * Number(cs.douhan_back_rate) / 100);
                const extBack = Math.floor(Number(cs.extension_total) * Number(cs.extension_back_rate) / 100);
                const totalBack = drinkBack + shimeiBack + douhanBack + extBack;
                return (
                  <div key={cs.id} className="card">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">{(cs.stage_name || cs.name)[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#3C4257]">{cs.stage_name || cs.name}</p>
                        <p className="text-xs text-[#8792A2]">{Number(cs.slip_count)}伝票</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[#8792A2]">バック合計</p>
                        <p className="text-lg font-bold text-[#FF2D78]">{formatCurrency(totalBack)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E3E8EE]">
                      {Number(cs.drink_total) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-pink-600">飲みバック</span>
                          <span>{formatCurrency(drinkBack)}</span>
                        </div>
                      )}
                      {Number(cs.shimei_total) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-pink-600">指名バック</span>
                          <span>{formatCurrency(shimeiBack)}</span>
                        </div>
                      )}
                      {Number(cs.douhan_total) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-amber-600">同伴バック</span>
                          <span>{formatCurrency(douhanBack)}</span>
                        </div>
                      )}
                      {Number(cs.extension_total) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blue-600">延長バック</span>
                          <span>{formatCurrency(extBack)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ===== キャスト追加/編集モーダル ===== */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-2xl md:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-semibold text-[#3C4257] mb-4">{editing ? "キャストを編集" : "キャストを追加"}</h2>
            <div className="space-y-3">
              <div><label className="block text-xs text-[#8792A2] mb-1">本名 *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8792A2] mb-1">源氏名</label>
                <input className="input" value={form.stage_name} onChange={(e) => setForm({ ...form, stage_name: e.target.value })} /></div>

              <div className="border-t border-[#E3E8EE] pt-3">
                <p className="text-xs font-medium text-[#3C4257] mb-2">バック率設定</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-xs text-[#8792A2] mb-1">飲みバック %</label>
                    <input type="number" className="input" value={form.drink_back_rate} onChange={(e) => setForm({ ...form, drink_back_rate: e.target.value })} /></div>
                  <div><label className="block text-xs text-[#8792A2] mb-1">指名バック %</label>
                    <input type="number" className="input" value={form.shimei_back_rate} onChange={(e) => setForm({ ...form, shimei_back_rate: e.target.value })} /></div>
                  <div><label className="block text-xs text-[#8792A2] mb-1">同伴バック %</label>
                    <input type="number" className="input" value={form.douhan_back_rate} onChange={(e) => setForm({ ...form, douhan_back_rate: e.target.value })} /></div>
                  <div><label className="block text-xs text-[#8792A2] mb-1">延長バック %</label>
                    <input type="number" className="input" value={form.extension_back_rate} onChange={(e) => setForm({ ...form, extension_back_rate: e.target.value })} /></div>
                </div>
              </div>

              <div><label className="block text-xs text-[#8792A2] mb-1">時給（円）</label>
                <input type="number" className="input" value={form.hourly_wage} onChange={(e) => setForm({ ...form, hourly_wage: e.target.value })} /></div>

              <div className="border-t border-[#E3E8EE] pt-3">
                <p className="text-xs font-medium text-[#3C4257] mb-1">キャストログイン設定</p>
                <p className="text-xs text-[#8792A2] mb-2">設定するとキャスト自身がログインして商品追加できます</p>
                <div><label className="block text-xs text-[#8792A2] mb-1">メールアドレス（ログインID）</label>
                  <input className="input" type="email" placeholder="cast@example.com"
                    value={form.login_email} onChange={(e) => setForm({ ...form, login_email: e.target.value })} /></div>
                <div className="mt-2"><label className="block text-xs text-[#8792A2] mb-1">パスワード{editing ? "（変更する場合のみ）" : ""}</label>
                  <input className="input" type="password" placeholder="6文字以上"
                    value={form.login_password} onChange={(e) => setForm({ ...form, login_password: e.target.value })} /></div>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">キャンセル</button>
              <button onClick={save} className="btn-primary flex-1">{editing ? "更新" : "追加"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Shine バナー */}
      <ShineBanner />
    </div>
  );
}
