"use client";

import { useState } from "react";
import { Crown, Check, Zap } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const STANDARD_FEATURES = [
  "1日15枚まで伝票作成",
  "商品マスタ管理",
  "卓管理",
  "税・サービス料設定",
  "基本ダッシュボード",
];

const PREMIUM_FEATURES = [
  "伝票作成数：無制限",
  "キャスト管理・給与計算",
  "顧客管理（CRM）",
  "詳細売上分析",
  "AI売上インサイト",
  "商品ランキング分析",
  "伝票ロック・不正防止",
  "操作ログ全記録",
  "データエクスポート（CSV）",
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.url) window.location.href = data.url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      toast.error(msg);
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-[#3C4257]">プランを選択</h1>
        <p className="text-[#8792A2] mt-1">現場で使える、シンプルで強力な会計システム</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* スタンダード */}
        <div className="card border-2 border-[#E3E8EE]">
          <div className="mb-4">
            <p className="text-sm text-[#8792A2] font-medium">スタンダード</p>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-3xl font-bold text-[#3C4257]">¥0</span>
              <span className="text-[#8792A2] text-sm mb-1">/月（テスト中）</span>
            </div>
          </div>
          <ul className="space-y-2 mb-6">
            {STANDARD_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#3C4257]">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />{f}
              </li>
            ))}
          </ul>
          <div className="btn-secondary text-center text-sm">現在のプラン</div>
        </div>

        {/* プレミアム */}
        <div className="card border-2 border-[#FF2D78] relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
            おすすめ
          </div>
          <div className="mb-4">
            <p className="text-sm text-[#FF2D78] font-medium flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />プレミアム
            </p>
            <div className="flex items-end gap-1 mt-1">
              <span className="text-3xl font-bold text-[#FF2D78]">¥5,000</span>
              <span className="text-[#8792A2] text-sm mb-1">/月</span>
            </div>
          </div>
          <ul className="space-y-2 mb-6">
            {PREMIUM_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[#3C4257]">
                <Zap className="w-4 h-4 text-[#FF2D78] shrink-0" />{f}
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="btn-primary w-full text-center">
            {loading ? "処理中..." : "プレミアムにアップグレード"}
          </button>
        </div>
      </div>

      <p className="text-center text-xs text-[#8792A2] mt-4">
        ※ Stripe連携による決済は別途設定が必要です。
        <Link href="/settings" className="text-[#FF2D78] ml-1">設定ページへ</Link>
      </p>
    </div>
  );
}
