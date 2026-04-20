"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { Crown, TrendingUp, BarChart3, Users, ShoppingBag } from "lucide-react";
import ShineBanner from "@/components/ShineBanner";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DailyData {
  business_date: string;
  total_revenue: number;
  total_slips: number;
}

interface ProductItem {
  product_name: string;
  total_qty: number;
  total_revenue: number;
}

export default function AnalyticsPage() {
  const { store, isPremium } = useAuthStore();
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductItem[]>([]);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!store?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${period}`);
      if (!res.ok) throw new Error();
      const { dailySales, topProducts: tp } = await res.json();
      setDailyData(dailySales.map((s: DailyData) => ({
        ...s,
        business_date: s.business_date.slice(5),
      })));
      setTopProducts(tp ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [store?.id, period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!isPremium()) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Crown className="w-12 h-12 text-yellow-400 mb-3" />
        <h2 className="text-xl font-bold text-[#3C4257] mb-2">プレミアム機能</h2>
        <p className="text-[#8792A2] text-sm mb-4">詳細分析はプレミアムプランでご利用いただけます</p>
        <Link href="/upgrade" className="btn-primary">プレミアムにアップグレード</Link>
      </div>
    );
  }

  const totalRevenue = dailyData.reduce((s, d) => s + Number(d.total_revenue), 0);
  const totalSlips = dailyData.reduce((s, d) => s + Number(d.total_slips), 0);
  const avgPerSlip = totalSlips > 0 ? Math.floor(totalRevenue / totalSlips) : 0;

  const insights: string[] = [];
  if (dailyData.length >= 2) {
    const latest = dailyData[dailyData.length - 1];
    const prev = dailyData[dailyData.length - 2];
    if (latest && prev) {
      if (Number(latest.total_revenue) > Number(prev.total_revenue) * 1.2) insights.push("昨日は売上が前日比20%以上増加しました 🎉");
      if (Number(latest.total_revenue) < Number(prev.total_revenue) * 0.8) insights.push("昨日の売上が前日比20%以上減少しています ⚠️");
    }
  }
  if (topProducts[0]) insights.push(`最も売れている商品は「${topProducts[0].product_name}」(${formatCurrency(Number(topProducts[0].total_revenue))})`);
  if (avgPerSlip > 10000) insights.push(`客単価 ${formatCurrency(avgPerSlip)} は高水準です 💰`);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#3C4257]">売上分析</h1>
        <div className="flex gap-1">
          {[7, 14, 30].map((d) => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${period === d ? "bg-[#FF2D78] text-white" : "bg-white border border-[#E3E8EE] text-[#8792A2]"}`}>
              {d}日
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "総売上", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-pink-600", bg: "bg-pink-50" },
          { label: "伝票枚数", value: `${totalSlips}枚`, icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "客単価", value: formatCurrency(avgPerSlip), icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card text-center">
            <div className={`inline-flex p-2 rounded-lg ${bg} mb-1`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <p className="text-xs text-[#8792A2]">{label}</p>
            <p className="text-base font-bold text-[#3C4257] mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {insights.length > 0 && (
        <div className="card mb-6 bg-gradient-to-r from-pink-50 to-blue-50 border-pink-100">
          <p className="text-xs font-medium text-pink-600 mb-2">✨ AI インサイト</p>
          <ul className="space-y-1">
            {insights.map((insight, i) => <li key={i} className="text-sm text-[#3C4257]">{insight}</li>)}
          </ul>
        </div>
      )}

      <div className="card mb-4">
        <h2 className="font-medium text-[#3C4257] text-sm mb-3">日次売上推移</h2>
        {loading ? (
          <div className="h-48 flex items-center justify-center text-[#8792A2] text-sm">読み込み中...</div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E3E8EE" />
              <XAxis dataKey="business_date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="total_revenue" stroke="#FF2D78" strokeWidth={2} dot={{ fill: "#FF2D78", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="card">
        <h2 className="font-medium text-[#3C4257] text-sm mb-3 flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-[#FF2D78]" />商品ランキング
        </h2>
        {topProducts.length === 0 ? (
          <p className="text-sm text-[#8792A2] text-center py-4">データなし</p>
        ) : (
          <div className="space-y-2">
            {topProducts.map((p, i) => {
              const maxRevenue = Number(topProducts[0]?.total_revenue) || 1;
              const pct = Math.round((Number(p.total_revenue) / maxRevenue) * 100);
              return (
                <div key={p.product_name} className="flex items-center gap-2">
                  <span className={`w-5 text-xs font-bold ${i === 0 ? "text-yellow-500" : i === 1 ? "text-gray-400" : i === 2 ? "text-amber-600" : "text-[#8792A2]"}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="truncate text-[#3C4257] font-medium">{p.product_name}</span>
                      <span className="text-[#8792A2] shrink-0 ml-2">{p.total_qty}個</span>
                    </div>
                    <div className="h-1.5 bg-[#F6F9FC] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#FF2D78]" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#FF2D78] shrink-0 w-20 text-right">{formatCurrency(Number(p.total_revenue))}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shine バナー */}
      <ShineBanner />
    </div>
  );
}
