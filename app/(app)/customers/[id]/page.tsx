"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, Star, Phone, Calendar, Edit2, Trash2, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import type { Customer, Slip } from "@/types/database";
import { cn } from "@/lib/utils";

type CustomerForm = {
  name: string; kana: string; phone: string; birthday: string;
  memo: string; preference_notes: string; ng_notes: string; is_vip: boolean;
};

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAdmin } = useAuthStore();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState<CustomerForm>({ name: "", kana: "", phone: "", birthday: "", memo: "", preference_notes: "", ng_notes: "", is_vip: false });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/customers/${id}`);
      if (!res.ok) throw new Error();
      const { customer: c, slips: s } = await res.json();
      setCustomer(c);
      setSlips(s ?? []);
      setForm({
        name: c.name, kana: c.kana ?? "", phone: c.phone ?? "",
        birthday: c.birthday ?? "", memo: c.memo ?? "",
        preference_notes: c.preference_notes ?? "", ng_notes: c.ng_notes ?? "",
        is_vip: c.is_vip,
      });
    } catch {
      toast.error("読み込み失敗");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function save() {
    if (!form.name) { toast.error("名前は必須です"); return; }
    try {
      const res = await fetch("/api/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id }),
      });
      if (!res.ok) throw new Error();
      toast.success("更新しました");
      setShowEdit(false);
      fetchData();
    } catch {
      toast.error("更新失敗");
    }
  }

  async function deleteCustomer() {
    if (!confirm("この顧客を削除しますか？")) return;
    try {
      await fetch("/api/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      toast.success("削除しました");
      router.push("/customers");
    } catch {
      toast.error("削除失敗");
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#FF2D78] border-t-transparent rounded-full animate-spin" /></div>;
  if (!customer) return <div className="p-6 text-center text-[#8792A2]">顧客が見つかりません</div>;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* ヘッダー */}
      <div className="sticky top-0 z-30 bg-white border-b border-[#E3E8EE] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-[#F6F9FC]">
          <ChevronLeft className="w-5 h-5 text-[#3C4257]" />
        </button>
        <h1 className="font-semibold text-[#3C4257] flex-1 truncate">{customer.name}</h1>
        {isAdmin() && (
          <div className="flex gap-1">
            <button onClick={() => setShowEdit(true)} className="p-1.5 rounded-lg hover:bg-[#F6F9FC]">
              <Edit2 className="w-4 h-4 text-[#8792A2]" />
            </button>
            <button onClick={deleteCustomer} className="p-1.5 rounded-lg hover:bg-red-50">
              <Trash2 className="w-4 h-4 text-[#DF1B41]" />
            </button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* プロフィール */}
        <div className="card">
          <div className="flex items-center gap-4 mb-4">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0",
              customer.is_vip ? "bg-gradient-to-br from-yellow-400 to-amber-500" : "bg-gradient-to-br from-pink-400 to-pink-500"
            )}>
              {customer.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#3C4257]">{customer.name}</h2>
                {customer.is_vip && <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />}
              </div>
              {customer.kana && <p className="text-sm text-[#8792A2]">{customer.kana}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#E3E8EE]">
            <div className="text-center">
              <p className="text-xs text-[#8792A2]">来店回数</p>
              <p className="text-xl font-bold text-[#3C4257]">{customer.visit_count}<span className="text-sm font-normal">回</span></p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#8792A2]">累計利用額</p>
              <p className="text-base font-bold text-[#FF2D78]">{formatCurrency(Number(customer.total_spend))}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-[#8792A2]">最終来店</p>
              <p className="text-sm font-medium text-[#3C4257]">{customer.last_visit_date ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* 連絡先・誕生日 */}
        {(customer.phone || customer.birthday) && (
          <div className="card space-y-2">
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-[#8792A2]" />
                <span className="text-[#3C4257]">{customer.phone}</span>
              </div>
            )}
            {customer.birthday && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-[#8792A2]" />
                <span className="text-[#3C4257]">{customer.birthday}</span>
              </div>
            )}
          </div>
        )}

        {/* メモ類 */}
        {(customer.preference_notes || customer.ng_notes || customer.memo) && (
          <div className="card space-y-3">
            {customer.preference_notes && (
              <div>
                <p className="text-xs font-medium text-emerald-600 mb-1">✅ 好み・嗜好</p>
                <p className="text-sm text-[#3C4257] whitespace-pre-wrap">{customer.preference_notes}</p>
              </div>
            )}
            {customer.ng_notes && (
              <div>
                <p className="text-xs font-medium text-red-500 mb-1">🚫 NGメモ</p>
                <p className="text-sm text-[#3C4257] whitespace-pre-wrap">{customer.ng_notes}</p>
              </div>
            )}
            {customer.memo && (
              <div>
                <p className="text-xs font-medium text-[#8792A2] mb-1">📝 メモ</p>
                <p className="text-sm text-[#3C4257] whitespace-pre-wrap">{customer.memo}</p>
              </div>
            )}
          </div>
        )}

        {/* 来店履歴 */}
        <div className="card">
          <h3 className="font-medium text-[#3C4257] text-sm mb-3 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#FF2D78]" />来店履歴
          </h3>
          {slips.length === 0 ? (
            <p className="text-sm text-[#8792A2] text-center py-4">履歴がありません</p>
          ) : (
            <div className="space-y-2">
              {slips.map((s) => (
                <Link key={s.id} href={`/slips/${s.id}`}
                  className="flex items-center justify-between py-2 border-b border-[#F6F9FC] last:border-0 hover:bg-[#F6F9FC] -mx-2 px-2 rounded transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[#3C4257]">{s.business_date}</p>
                    <p className="text-xs text-[#8792A2]">{s.name || s.slip_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#FF2D78]">{formatCurrency(Number(s.total_amount))}</p>
                    <p className="text-xs text-[#8792A2]">{s.payment_method === "cash" ? "現金" : s.payment_method === "card" ? "カード" : "その他"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 編集モーダル */}
      {showEdit && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowEdit(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-2xl md:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-semibold text-[#3C4257] mb-4">顧客情報を編集</h2>
            <div className="space-y-3">
              <div><label className="block text-xs text-[#8792A2] mb-1">お名前 *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8792A2] mb-1">よみがな</label>
                <input className="input" value={form.kana} onChange={(e) => setForm({ ...form, kana: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8792A2] mb-1">電話番号</label>
                <input className="input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8792A2] mb-1">誕生日</label>
                <input className="input" type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8792A2] mb-1">好み・嗜好</label>
                <textarea className="input resize-none text-sm" rows={2} value={form.preference_notes} onChange={(e) => setForm({ ...form, preference_notes: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8792A2] mb-1">NGメモ</label>
                <textarea className="input resize-none text-sm" rows={2} value={form.ng_notes} onChange={(e) => setForm({ ...form, ng_notes: e.target.value })} /></div>
              <div><label className="block text-xs text-[#8792A2] mb-1">メモ</label>
                <textarea className="input resize-none text-sm" rows={2} value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} /></div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_vip} onChange={(e) => setForm({ ...form, is_vip: e.target.checked })} className="w-4 h-4 accent-[#FF2D78]" />
                <span className="text-sm text-[#3C4257]">VIP顧客</span>
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowEdit(false)} className="btn-secondary flex-1">キャンセル</button>
              <button onClick={save} className="btn-primary flex-1">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
