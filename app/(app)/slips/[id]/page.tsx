"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency, formatElapsed, getElapsedMinutes } from "@/lib/utils";
import {
  Plus, Minus, Trash2, Edit2, Clock, CreditCard, Banknote,
  Lock, Unlock, ChevronLeft, Star, History, Timer, FileText, Receipt
} from "lucide-react";
import toast from "react-hot-toast";
import ProductSelector from "@/components/slip/ProductSelector";
import ReceiptModal from "@/components/slip/ReceiptModal";
import type { Slip, SlipItem, Product, Cast } from "@/types/database";

interface SlipWithItems extends Slip {
  items: SlipItem[];
}

export default function SlipDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { store, storeUser, isAdmin } = useAuthStore();

  const [slip, setSlip] = useState<SlipWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProducts, setShowProducts] = useState(false);
  const [castNames, setCastNames] = useState<Record<string, string>>({});
  const [editingName, setEditingName] = useState(false);
  const [slipName, setSlipName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [recipientName, setRecipientName] = useState("");

  void storeUser;

  const fetchSlip = useCallback(async () => {
    try {
      const res = await fetch(`/api/slips/${id}`);
      if (!res.ok) throw new Error();
      const { slip: s, items } = await res.json();
      setSlip({ ...s, items });
      setSlipName(s.name ?? "");
      setNotes(s.notes ?? "");
      setElapsed(s.timer_started_at ? getElapsedMinutes(s.timer_started_at) : getElapsedMinutes(s.opened_at));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSlip();
    const timer = setInterval(() => setElapsed((e) => e + 1), 60000);
    // キャスト名マップを取得
    fetch("/api/casts").then(r => r.json()).then(({ casts }) => {
      if (casts) {
        const map: Record<string, string> = {};
        (casts as Cast[]).forEach((c) => { map[c.id] = c.stage_name || c.name; });
        setCastNames(map);
      }
    }).catch(() => {});
    return () => clearInterval(timer);
  }, [fetchSlip]);

  async function patchSlip(action: string, data?: object) {
    const res = await fetch(`/api/slips/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...data }),
    });
    if (!res.ok) throw new Error();
    const { slip: s, items } = await res.json();
    setSlip({ ...s, items });
    return { slip: s, items };
  }

  async function addProduct(product: Product) {
    if (!slip) return;
    try {
      const existing = slip.items.find((i) => i.product_id === product.id);
      if (existing) {
        await updateQuantity(existing.id, existing.quantity + 1);
      } else {
        await patchSlip("add_item", {
          productId: product.id,
          productName: product.name,
          productPrice: product.price,
          quantity: 1,
          itemType: "product",
        });
        await fetchSlip();
      }
      toast.success(`${product.name}を追加`);
      setShowProducts(false);
    } catch {
      toast.error("追加失敗");
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }
    try {
      await patchSlip("update_item", { itemId, quantity });
    } catch {
      toast.error("更新失敗");
    }
  }

  async function removeItem(itemId: string) {
    try {
      await patchSlip("remove_item", { itemId });
      await fetchSlip();
    } catch {
      toast.error("削除失敗");
    }
  }

  async function saveName() {
    try {
      await patchSlip("update", { name: slipName });
      setSlip((prev) => prev ? { ...prev, name: slipName } : null);
      setEditingName(false);
      toast.success("伝票名を変更しました");
    } catch {
      toast.error("更新失敗");
    }
  }

  async function saveNotes() {
    if (!slip) return;
    setSavingNotes(true);
    try {
      await patchSlip("update", { notes });
      toast.success("メモを保存しました");
    } catch {
      toast.error("メモ保存失敗");
    } finally {
      setSavingNotes(false);
    }
  }

  async function addSet() {
    if (!slip) return;
    if (Number(slip.set_price) <= 0) {
      toast.error("セット料金が設定されていません");
      return;
    }
    try {
      // セットアイテム追加
      await patchSlip("add_item", {
        productName: `セット料金 (${slip.set_minutes}分)`,
        productPrice: slip.set_price,
        quantity: 1,
        itemType: "set",
      });
      // タイマーリセット
      await patchSlip("reset_timer", {});
      await fetchSlip();
      toast.success(`セット追加・タイマーリセット (${slip.set_minutes}分)`);
    } catch {
      toast.error("セット追加失敗");
    }
  }

  async function startExtension() {
    if (!slip || !store) return;
    if (Number(slip.extension_price) <= 0) {
      toast.error("延長料金が設定されていません");
      return;
    }
    try {
      await patchSlip("add_item", {
        productName: `延長 ${Number(slip.extension_count) + 1}回目 (${slip.extension_minutes}分)`,
        productPrice: slip.extension_price,
        quantity: 1,
        itemType: "extension",
      });
      await patchSlip("extend", {});
      // タイマーリセット（延長時間でリスタート）
      await patchSlip("reset_timer", {});
      await fetchSlip();
      toast.success(`延長追加・タイマーリセット (${slip.extension_minutes}分)`);
    } catch {
      toast.error("延長追加失敗");
    }
  }

  async function closeSlip(paymentMethod: "cash" | "card" | "other") {
    if (!slip) return;
    setSubmitting(true);
    try {
      // 税計算はAPIサーバー側で完結（storeのDB参照）
      await patchSlip("close", { paymentMethod });
      toast.success("会計完了");
      router.push("/tables");
    } catch {
      toast.error("会計処理に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleLock() {
    if (!slip || !isAdmin()) return;
    try {
      if (slip.is_locked) {
        const reason = prompt("ロック解除の理由を入力してください");
        if (!reason) return;
      }
      toast("ロック機能は管理画面から操作してください");
    } catch {
      toast.error("失敗しました");
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#FF2D78] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!slip) return <div className="p-6 text-center text-[#8792A2]">伝票が見つかりません</div>;

  const isClosed = slip.status === "closed" || slip.status === "voided";
  const isLocked = slip.is_locked;

  // subtotal = slip_items合計（セット料金アイテム含む）。set_priceは別途加算しない
  const displaySubtotal = Number(slip.subtotal ?? 0);
  const taxRate = Number(store?.tax_rate ?? 0);
  const serviceRate = Number(store?.service_rate ?? 0);
  const taxAmount = store?.tax_type === "percent"
    ? Math.floor(displaySubtotal * taxRate / 100)
    : taxRate;
  const serviceAmount = store?.service_type === "percent"
    ? Math.floor(displaySubtotal * serviceRate / 100)
    : serviceRate;
  const displayTotal = isClosed
    ? Number(slip.total_amount ?? 0)
    : displaySubtotal + taxAmount + serviceAmount;

  return (
    <div className="max-w-2xl mx-auto pb-32">
      {/* ヘッダー */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E3E8EE] px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-[#F6F9FC]">
            <ChevronLeft className="w-5 h-5 text-[#3C4257]" />
          </button>

          {editingName ? (
            <div className="flex items-center gap-2 flex-1">
              <input className="input flex-1 py-1.5 text-sm" value={slipName}
                onChange={(e) => setSlipName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                autoFocus />
              <button onClick={saveName} className="text-xs text-[#FF2D78] font-medium">保存</button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <h1 className="font-semibold text-[#3C4257] truncate">{slip.name || slip.slip_number}</h1>
              {!isClosed && <button onClick={() => setEditingName(true)}><Edit2 className="w-3.5 h-3.5 text-[#8792A2]" /></button>}
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 text-xs text-[#8792A2]">
              <Clock className="w-3.5 h-3.5" /><span>{formatElapsed(elapsed)}</span>
            </div>
            {isAdmin() && (
              <button onClick={toggleLock} className="p-1.5 rounded-lg hover:bg-[#F6F9FC]">
                {isLocked ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4 text-[#8792A2]" />}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* 商品リスト（セット料金もitems内に含まれる） */}
        <div className="card divide-y divide-[#E3E8EE]">
          {slip.items.length === 0 ? (
            <div className="text-center py-8 text-[#8792A2]"><p className="text-sm">商品を追加してください</p></div>
          ) : (
            slip.items.map((item) => {
              const isSet = item.item_type === "set";
              return (
              <div key={item.id} className={`flex items-center gap-3 py-3 first:pt-0 last:pb-0 ${isSet ? "bg-pink-50 -mx-4 px-4 first:rounded-t-xl" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isSet && <Timer className="w-3.5 h-3.5 text-pink-500 shrink-0" />}
                    <p className={`text-sm font-medium truncate ${isSet ? "text-pink-700" : "text-[#3C4257]"}`}>{item.product_name}</p>
                    {item.cast_id && castNames[item.cast_id] && (
                      <span className="inline-flex items-center text-xs bg-pink-50 text-pink-600 border border-pink-200 px-1.5 py-0.5 rounded-full font-medium shrink-0">
                        {castNames[item.cast_id]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8792A2]">{formatCurrency(item.product_price)} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!isClosed && !isLocked && (
                    <>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-[#E3E8EE] flex items-center justify-center hover:border-[#FF2D78] active:scale-90 transition-all">
                        <Minus className="w-3.5 h-3.5 text-[#3C4257]" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-[#3C4257]">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-[#FF2D78] bg-pink-50 flex items-center justify-center hover:bg-pink-100 active:scale-90 transition-all">
                        <Plus className="w-3.5 h-3.5 text-[#FF2D78]" />
                      </button>
                      <button onClick={() => removeItem(item.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 active:scale-90 ml-1">
                        <Trash2 className="w-3.5 h-3.5 text-[#DF1B41]" />
                      </button>
                    </>
                  )}
                  <span className={`font-bold text-sm min-w-[56px] text-right ${isSet ? "text-pink-700" : "text-[#3C4257]"}`}>{formatCurrency(item.subtotal)}</span>
                </div>
              </div>
            );})
          )}
        </div>

        {/* 商品追加・セット追加・延長追加 */}
        {!isClosed && !isLocked && (
          <div className="space-y-2">
            <button onClick={() => setShowProducts(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[#FF2D78] text-[#FF2D78] font-medium text-sm hover:bg-pink-50 active:scale-[0.98] transition-all">
              <Plus className="w-4 h-4" />商品を追加
            </button>
            <div className="flex gap-2">
              {Number(slip.set_price) > 0 && (
                <button onClick={addSet}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-sm font-medium hover:bg-pink-100 active:scale-95 transition-all">
                  <Timer className="w-4 h-4" />セット追加
                  <span className="text-xs opacity-70">({slip.set_minutes}分)</span>
                </button>
              )}
              {Number(slip.extension_price) > 0 && (
                <button onClick={startExtension}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-100 active:scale-95 transition-all">
                  <History className="w-4 h-4" />延長追加
                  <span className="text-xs opacity-70">({slip.extension_minutes}分)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 合計 */}
        <div className="card space-y-2">
          <div className="flex justify-between text-sm text-[#8792A2]">
            <span>小計</span><span>{formatCurrency(displaySubtotal)}</span>
          </div>
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm text-[#8792A2]">
              <span>消費税 ({taxRate}%)</span><span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          {serviceAmount > 0 && (
            <div className="flex justify-between text-sm text-[#8792A2]">
              <span>サービス料 ({serviceRate}%)</span><span>{formatCurrency(serviceAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-[#E3E8EE]">
            <span className="font-bold text-[#3C4257]">合計</span>
            <span className="text-2xl font-bold text-[#FF2D78]">{formatCurrency(displayTotal)}</span>
          </div>
        </div>

        {/* メモ */}
        <div className="card space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#8792A2]" />
            <span className="text-sm font-medium text-[#3C4257]">メモ</span>
            <span className="text-xs text-[#8792A2]">（スタッフ共有）</span>
          </div>
          {isClosed ? (
            <p className="text-sm text-[#3C4257] bg-gray-50 rounded-lg p-2 min-h-[48px]">
              {notes || <span className="text-[#8792A2]">メモなし</span>}
            </p>
          ) : (
            <>
              <textarea
                className="input w-full resize-none text-sm"
                rows={3}
                placeholder="スタッフへの連絡事項、お客様の要望など..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <button
                onClick={saveNotes}
                disabled={savingNotes}
                className="text-xs text-[#FF2D78] font-medium disabled:opacity-50"
              >
                {savingNotes ? "保存中..." : "メモを保存"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 会計フッター — bottom-16でボトムナビ上に固定 */}
      {!isClosed && !isLocked && (
        <div
          className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-56 bg-white border-t border-[#E3E8EE] p-4 z-[45]"
          style={{ boxShadow: "0 -4px 20px rgba(0,0,0,.08)" }}
        >
          <div className="max-w-2xl mx-auto">
            <p className="text-xs text-[#8792A2] text-center mb-2">
              合計 {formatCurrency(displayTotal)} の会計方法を選択
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => closeSlip("cash")} disabled={submitting}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#09825D] text-white font-medium active:scale-95 transition-all disabled:opacity-50">
                <Banknote className="w-5 h-5" />現金
              </button>
              <button onClick={() => closeSlip("card")} disabled={submitting}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl btn-primary active:scale-95 transition-all disabled:opacity-50">
                <CreditCard className="w-5 h-5" />カード
              </button>
            </div>
          </div>
        </div>
      )}

      {isClosed && (
        <div className="mx-4 space-y-2">
          <div className="card text-center bg-emerald-50 border-emerald-200">
            <div className="flex items-center justify-center gap-2 text-emerald-700">
              <Star className="w-4 h-4" />
              <span className="font-medium text-sm">会計済み ({slip.payment_method === "cash" ? "現金" : "カード"})</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(slip.total_amount)}</p>
          </div>
          {/* 領収書発行 */}
          <div className="card">
            <p className="text-xs text-[#8792A2] mb-2">領収書の宛名（空白可）</p>
            <div className="flex gap-2">
              <input
                className="input flex-1 text-sm"
                placeholder="株式会社〇〇 / 山田様 など"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
              <button onClick={() => setShowReceipt(true)}
                className="flex items-center gap-1.5 btn-secondary text-sm px-3 whitespace-nowrap">
                <Receipt className="w-4 h-4" />領収書
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 商品選択シート — z-[60]でボトムナビより前面 */}
      {showProducts && store && (
        <ProductSelector storeId={store.id} onSelect={addProduct} onClose={() => setShowProducts(false)} />
      )}

      {/* 領収書モーダル */}
      {showReceipt && slip && store && (
        <ReceiptModal
          slip={slip}
          store={store}
          recipientName={recipientName}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
