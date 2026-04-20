"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Save, Crown, Shield, Store as StoreIcon, Timer, LogOut, Sparkles, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { signOut } from "next-auth/react";
import type { Store } from "@/types/database";

interface StoreSettings {
  timerEnabled?: boolean;
  defaultTimerMin?: number;
  defaultSetMinutes?: number;
  defaultSetPrice?: number;
  defaultExtensionMinutes?: number;
  defaultExtensionPrice?: number;
  wageUnitMinutes?: 30 | 60;
}

export default function SettingsPage() {
  const { store, storeUser, isAdmin, isPremium, setStore } = useAuthStore();
  const s = (store?.settings ?? {}) as StoreSettings;

  const [form, setForm] = useState({
    name: store?.name ?? "",
    tax_rate: String(store?.tax_rate ?? 10),
    service_rate: String(store?.service_rate ?? 10),
    tax_type: store?.tax_type ?? "percent",
    service_type: store?.service_type ?? "percent",
  });
  const [setForm2, setSetForm2] = useState({
    defaultSetMinutes: String(s.defaultSetMinutes ?? 60),
    defaultSetPrice: String(s.defaultSetPrice ?? 0),
    defaultExtensionMinutes: String(s.defaultExtensionMinutes ?? 30),
    defaultExtensionPrice: String(s.defaultExtensionPrice ?? 0),
  });
  const [wageUnitMinutes, setWageUnitMinutes] = useState<30 | 60>(s.wageUnitMinutes ?? 60);
  const [saving, setSaving] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const upgraded = searchParams.get("upgraded");
    const canceled = searchParams.get("canceled");
    if (upgraded === "true") {
      toast.success("プレミアムプランへのアップグレードが完了しました！");
    } else if (canceled === "true") {
      toast("アップグレードをキャンセルしました");
    }
  }, [searchParams]);

  async function handleUpgrade() {
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.url) window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      toast.error(msg);
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.url) window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      toast.error(msg);
    } finally {
      setPortalLoading(false);
    }
  }

  async function save() {
    if (!store?.id) return;
    setSaving(true);
    try {
      // 店舗基本設定
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          tax_rate: Number(form.tax_rate),
          service_rate: Number(form.service_rate),
          tax_type: form.tax_type,
          service_type: form.service_type,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();

      // セット/延長デフォルト設定をsettings JSONBに保存
      const existingSettings = (typeof data.settings === "object" && data.settings) ? data.settings as StoreSettings : {};
      const newSettings: StoreSettings = {
        ...existingSettings,
        defaultSetMinutes: Number(setForm2.defaultSetMinutes),
        defaultSetPrice: Number(setForm2.defaultSetPrice),
        defaultExtensionMinutes: Number(setForm2.defaultExtensionMinutes),
        defaultExtensionPrice: Number(setForm2.defaultExtensionPrice),
        wageUnitMinutes,
      };
      const res2 = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: newSettings }),
      });
      if (!res2.ok) throw new Error();
      const data2 = await res2.json();
      setStore(data2 as Store);
      toast.success("設定を保存しました");
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold text-[#3C4257]">設定</h1>

      {/* プランカード */}
      {isPremium() ? (
        <div className="card border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-500" />
            <p className="font-semibold text-[#3C4257]">プレミアムプラン</p>
            <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">有効</span>
          </div>
          <p className="text-xs text-[#8792A2] mb-3">伝票保存30日・全機能アンロック済み</p>
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-yellow-300 text-yellow-700 text-sm hover:bg-yellow-100 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            {portalLoading ? "読み込み中..." : "プラン・支払い管理"}
          </button>
        </div>
      ) : (
        <div className="card border-[#FFD6E7]">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-[#8792A2]" />
            <p className="font-medium text-[#3C4257]">スタンダードプラン</p>
          </div>
          <p className="text-xs text-[#8792A2] mb-4">1日{store?.daily_slip_limit ?? 15}枚まで・伝票保存3日</p>
          <div className="bg-gradient-to-r from-[#FF2D78] to-[#FF6B6B] rounded-xl p-4 text-white mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">プレミアムプランにアップグレード</span>
            </div>
            <p className="text-xs opacity-80 mb-3">月額 ¥5,000 / 伝票無制限・30日保存・全機能</p>
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full bg-white text-[#FF2D78] font-semibold py-2.5 rounded-lg text-sm hover:bg-pink-50 transition-colors active:scale-95">
              {checkoutLoading ? "処理中..." : "今すぐアップグレード →"}
            </button>
          </div>
        </div>
      )}

      {isAdmin() && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <StoreIcon className="w-4 h-4 text-[#FF2D78]" />
            <h2 className="font-medium text-[#3C4257]">店舗設定</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-[#8792A2] mb-1">店舗名</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">消費税</label>
                <div className="flex gap-1">
                  <select className="input py-2 flex-1" value={form.tax_type} onChange={(e) => setForm({ ...form, tax_type: e.target.value as "percent" | "fixed" })}>
                    <option value="percent">%</option>
                    <option value="fixed">固定額</option>
                  </select>
                  <input type="number" className="input py-2 w-20" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">サービス料</label>
                <div className="flex gap-1">
                  <select className="input py-2 flex-1" value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value as "percent" | "fixed" })}>
                    <option value="percent">%</option>
                    <option value="fixed">固定額</option>
                  </select>
                  <input type="number" className="input py-2 w-20" value={form.service_rate} onChange={(e) => setForm({ ...form, service_rate: e.target.value })} />
                </div>
              </div>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-1.5 w-full justify-center mt-1">
              <Save className="w-4 h-4" />{saving ? "保存中..." : "設定を保存"}
            </button>
          </div>
        </div>
      )}

      {isAdmin() && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Timer className="w-4 h-4 text-[#FF2D78]" />
            <h2 className="font-medium text-[#3C4257]">セット・延長 デフォルト設定</h2>
          </div>
          <p className="text-xs text-[#8792A2] mb-3">新規伝票作成時に自動で入力される初期値です。</p>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">セット時間（分）</label>
                <input type="number" min={0} step={10} className="input"
                  value={setForm2.defaultSetMinutes}
                  onChange={(e) => setSetForm2({ ...setForm2, defaultSetMinutes: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">セット料金（円）</label>
                <input type="number" min={0} step={100} className="input"
                  value={setForm2.defaultSetPrice}
                  onChange={(e) => setSetForm2({ ...setForm2, defaultSetPrice: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">延長単位（分）</label>
                <input type="number" min={0} step={10} className="input"
                  value={setForm2.defaultExtensionMinutes}
                  onChange={(e) => setSetForm2({ ...setForm2, defaultExtensionMinutes: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">延長料金（円）</label>
                <input type="number" min={0} step={100} className="input"
                  value={setForm2.defaultExtensionPrice}
                  onChange={(e) => setSetForm2({ ...setForm2, defaultExtensionPrice: e.target.value })} />
              </div>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-1.5 w-full justify-center mt-1">
              <Save className="w-4 h-4" />{saving ? "保存中..." : "設定を保存"}
            </button>
          </div>
        </div>
      )}

      {isAdmin() && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-[#FF2D78]" />
            <h2 className="font-medium text-[#3C4257]">キャスト時給計算単位</h2>
          </div>
          <p className="text-xs text-[#8792A2] mb-3">
            勤務時間の端数処理ルール：<br />
            ・単位の15分以下の端数は切り捨て<br />
            ・16分以上の端数は次の単位に繰り上げ
          </p>
          <div className="flex gap-2 mb-3">
            {([60, 30] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setWageUnitMinutes(unit)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  wageUnitMinutes === unit
                    ? "bg-[#FF2D78] text-white border-[#FF2D78]"
                    : "bg-white text-[#3C2233] border-[#FFD6E7] hover:border-[#FF2D78]"
                }`}>
                {unit === 60 ? "1時間単位" : "30分単位"}
              </button>
            ))}
          </div>
          <p className="text-xs text-[#A07090] bg-pink-50 rounded-lg px-3 py-2">
            例（{wageUnitMinutes === 60 ? "1時間単位" : "30分単位"}・時給¥1,000）：
            {wageUnitMinutes === 60
              ? "　1h00m → ¥1,000　／　1h15m → ¥1,000　／　1h16m → ¥2,000"
              : "　30m → ¥500　／　1h15m → ¥1,000　／　1h16m → ¥1,500"}
          </p>
          <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-1.5 w-full justify-center mt-3">
            <Save className="w-4 h-4" />{saving ? "保存中..." : "設定を保存"}
          </button>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-[#FF2D78]" />
          <h2 className="font-medium text-[#3C4257]">アカウント</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#8792A2]">名前</span>
            <span className="text-[#3C4257] font-medium">{storeUser?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8792A2]">メール</span>
            <span className="text-[#3C4257]">{storeUser?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8792A2]">権限</span>
            <span className={`font-medium ${storeUser?.role === "admin" ? "text-[#FF2D78]" : "text-[#3C4257]"}`}>
              {storeUser?.role === "admin" ? "管理者" : storeUser?.role === "manager" ? "マネージャー" : "スタッフ"}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          if (confirm("ログアウトしますか？")) {
            signOut({ callbackUrl: "/login" });
          }
        }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors active:scale-95">
        <LogOut className="w-4 h-4" />ログアウト
      </button>

      <div className="text-center text-xs text-[#8792A2] py-2">伝票SaaS v1.0.0 — 水商売向け会計管理システム</div>
    </div>
  );
}
