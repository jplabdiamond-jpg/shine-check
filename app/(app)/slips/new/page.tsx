"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, Timer, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function NewSlipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { store, storeUser } = useAuthStore();
  const tableId = searchParams.get("tableId");

  const [name, setName] = useState("");
  const [setMinutes, setSetMinutes] = useState(60);
  const [setPrice, setSetPrice] = useState(0);
  const [extensionMinutes, setExtensionMinutes] = useState(30);
  const [extensionPrice, setExtensionPrice] = useState(0);
  const [creating, setCreating] = useState(false);

  // storeのデフォルト設定を反映
  useEffect(() => {
    const s = store?.settings as {
      defaultTimerMin?: number;
      defaultSetMinutes?: number;
      defaultSetPrice?: number;
      defaultExtensionMinutes?: number;
      defaultExtensionPrice?: number;
    } | undefined;
    if (!s) return;
    if (s.defaultSetMinutes) setSetMinutes(s.defaultSetMinutes);
    else if (s.defaultTimerMin) setSetMinutes(s.defaultTimerMin);
    if (s.defaultSetPrice) setSetPrice(s.defaultSetPrice);
    if (s.defaultExtensionMinutes) setExtensionMinutes(s.defaultExtensionMinutes);
    if (s.defaultExtensionPrice) setExtensionPrice(s.defaultExtensionPrice);
  }, [store?.settings]);

  async function createSlip() {
    if (!store?.id || !storeUser?.id) return;
    setCreating(true);
    try {
      const body: Record<string, unknown> = {
        tableId: tableId ?? null,
        setMinutes,
        setPrice,
        extensionMinutes,
        extensionPrice,
      };
      if (name.trim()) body.name = name.trim();

      const res = await fetch("/api/slips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error ?? "伝票作成に失敗しました");
      }
      const slip = await res.json();
      router.replace(`/slips/${slip.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "伝票作成に失敗しました");
      setCreating(false);
    }
  }

  const presetSets = [
    { label: "60分", min: 60 },
    { label: "90分", min: 90 },
    { label: "120分", min: 120 },
  ];

  const presetExt = [
    { label: "30分", min: 30 },
    { label: "60分", min: 60 },
  ];

  return (
    <div className="max-w-md mx-auto pb-8">
      <div className="sticky top-0 z-30 bg-white border-b border-[#E3E8EE] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-[#F6F9FC]">
          <ChevronLeft className="w-5 h-5 text-[#3C4257]" />
        </button>
        <h1 className="font-semibold text-[#3C4257]">新規伝票</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* 伝票名 */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-[#3C4257]">伝票情報</h2>
          <div>
            <label className="block text-xs text-[#8792A2] mb-1">お客様名・伝票名（任意）</label>
            <input
              type="text"
              className="input w-full"
              placeholder="例：山田様、テーブル5"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* セット料金 */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#FF2D78]" />
            <h2 className="text-sm font-semibold text-[#3C4257]">セット料金</h2>
          </div>

          <div>
            <label className="block text-xs text-[#8792A2] mb-1">セット時間</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={10}
                className="input w-24 text-center font-bold"
                value={setMinutes}
                onChange={(e) => setSetMinutes(Number(e.target.value))}
              />
              <span className="text-sm text-[#8792A2]">分</span>
              <div className="flex gap-1 ml-1">
                {presetSets.map((p) => (
                  <button
                    key={p.min}
                    onClick={() => setSetMinutes(p.min)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      setMinutes === p.min ? "bg-[#FF2D78] text-white" : "border border-[#E3E8EE] text-[#8792A2]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8792A2] mb-1">セット料金（円）</label>
            <input
              type="number"
              min={0}
              step={100}
              className="input w-full font-bold text-lg"
              placeholder="0"
              value={setPrice === 0 ? "" : setPrice}
              onChange={(e) => setSetPrice(Number(e.target.value))}
            />
            {setPrice > 0 && (
              <p className="text-xs text-[#8792A2] mt-1">{formatCurrency(setPrice)}</p>
            )}
          </div>
        </div>

        {/* 延長料金 */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-[#3C4257]">延長設定</h2>

          <div>
            <label className="block text-xs text-[#8792A2] mb-1">延長単位</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                step={10}
                className="input w-24 text-center font-bold"
                value={extensionMinutes}
                onChange={(e) => setExtensionMinutes(Number(e.target.value))}
              />
              <span className="text-sm text-[#8792A2]">分ごと</span>
              <div className="flex gap-1 ml-1">
                {presetExt.map((p) => (
                  <button
                    key={p.min}
                    onClick={() => setExtensionMinutes(p.min)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      extensionMinutes === p.min ? "bg-[#FF2D78] text-white" : "border border-[#E3E8EE] text-[#8792A2]"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#8792A2] mb-1">延長料金（円）</label>
            <input
              type="number"
              min={0}
              step={100}
              className="input w-full font-bold text-lg"
              placeholder="0"
              value={extensionPrice === 0 ? "" : extensionPrice}
              onChange={(e) => setExtensionPrice(Number(e.target.value))}
            />
            {extensionPrice > 0 && (
              <p className="text-xs text-[#8792A2] mt-1">{formatCurrency(extensionPrice)} / {extensionMinutes}分</p>
            )}
          </div>
        </div>

        {/* 開始ボタン */}
        <button
          onClick={createSlip}
          disabled={creating}
          className="w-full btn-primary py-4 text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {creating ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              作成中...
            </>
          ) : (
            "伝票を開始する"
          )}
        </button>

        <p className="text-xs text-center text-[#8792A2]">
          セット料金・延長料金は0円でも作成できます
        </p>
      </div>
    </div>
  );
}
