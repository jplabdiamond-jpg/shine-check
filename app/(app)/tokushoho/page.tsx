import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TokushohoPage() {
  const items: { label: string; value: string }[] = [
    { label: "販売業者", value: "（運営者名をご記入ください）" },
    { label: "運営責任者", value: "（責任者名をご記入ください）" },
    { label: "所在地", value: "（住所をご記入ください）" },
    { label: "電話番号", value: "（電話番号をご記入ください）※メールでのお問い合わせを優先いたします" },
    { label: "メールアドレス", value: "（メールアドレスをご記入ください）" },
    { label: "サービス名", value: "水商売向け伝票管理SaaS" },
    { label: "サービスの内容", value: "水商売・夜業態の店舗向け伝票管理・売上集計・スタッフ管理機能を提供するSaaSサービス" },
    {
      label: "販売価格",
      value: "スタンダードプラン：無料\nプレミアムプラン：月額料金は別途料金表をご確認ください（税込）",
    },
    { label: "支払い方法", value: "クレジットカード（Visa / Mastercard / American Express / JCB）" },
    { label: "支払い時期", value: "ご登録月より毎月同日に自動決済" },
    {
      label: "サービス提供時期",
      value: "決済完了後、即時ご利用いただけます",
    },
    {
      label: "返品・キャンセルについて",
      value:
        "月額サービスの性質上、原則として返金・キャンセルは承っておりません。ただし、当社の責に帰すべき事由によりサービスを提供できない場合はこの限りではありません。",
    },
    {
      label: "動作環境",
      value: "インターネット接続環境およびWebブラウザ（最新版のChrome / Safari / Firefox / Edge を推奨）",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F9FC] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-[#8792A2] hover:text-[#FF2D78] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            ダッシュボードへ戻る
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E3E8EE] p-6">
          <h1 className="text-xl font-bold text-[#3C4257] mb-1 border-b-2 border-[#FF2D78] pb-3">
            特定商取引法に基づく表記
          </h1>
          <p className="text-xs text-[#8792A2] mb-8">制定日：2025年4月1日</p>

          <div className="divide-y divide-[#E3E8EE]">
            {items.map(({ label, value }) => (
              <div key={label} className="py-4 grid grid-cols-3 gap-4">
                <dt className="text-xs font-semibold text-[#3C4257] col-span-1">{label}</dt>
                <dd className="text-xs text-[#5E6F85] leading-relaxed whitespace-pre-line col-span-2">{value}</dd>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-[#8792A2]">最終更新日：2025年4月1日</p>
        </div>
      </div>
    </div>
  );
}
