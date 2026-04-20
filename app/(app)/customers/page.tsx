"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { Plus, Crown, Search, Star, Phone, User, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import type { Customer } from "@/types/database";
import { cn } from "@/lib/utils";

type CustomerForm = {
  name: string; kana: string; phone: string; birthday: string;
  memo: string; preference_notes: string; ng_notes: string; is_vip: boolean;
};
const emptyForm: CustomerForm = { name: "", kana: "", phone: "", birthday: "", memo: "", preference_notes: "", ng_notes: "", is_vip: false };

export default function CustomersPage() {
  const { store, isPremium, isAdmin } = useAuthStore();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [q, setQ] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  const fetchCustomers = useCallback(async (query = "") => {
    if (!store?.id) return;
    try {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error();
      const { customers: data } = await res.json();
      setCustomers(data ?? []);
    } catch {
      toast.error("読み込み失敗");
    }
  }, [store?.id]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(c: Customer) {
    setEditing(c);
    setForm({
      name: c.name, kana: c.kana ?? "", phone: c.phone ?? "",
      birthday: c.birthday ?? "", memo: c.memo ?? "",
      preference_notes: c.preference_notes ?? "", ng_notes: c.ng_notes ?? "",
      is_vip: c.is_vip,
    });
    setShowModal(true);
  }

  async function save() {
    if (!form.name) { toast.error("名前は必須です"); return; }
    try {
      const res = await fetch("/api/customers", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...form, id: editing.id } : form),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "更新しました" : "登録しました");
      setShowModal(false);
      fetchCustomers(q);
    } catch {
      toast.error("保存失敗");
    }
  }

  async function handleSearch(value: string) {
    setQ(value);
    await fetchCustomers(value);
  }

  if (!isPremium()) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Crown className="w-12 h-12 text-yellow-400 mb-3" />
        <h2 className="text-xl font-bold text-[#3C4257] mb-2">プレミアム機能</h2>
        <p className="text-[#8792A2] text-sm mb-4">顧客管理はプレミアムプランでご利用いただけます</p>
        <Link href="/upgrade" className="btn-primary">プレミアムにアップグレード</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#3C4257]">顧客管理</h1>
        {isAdmin() && (
          <button onClick={openNew} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-4 h-4" />追加
          </button>
        )}
      </div>

      {/* 検索 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8792A2]" />
        <input
          className="input pl-9"
          placeholder="名前・よみがな・電話番号で検索"
          value={q}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-16 text-[#8792A2]">
          <User className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{q ? "該当する顧客が見つかりません" : "顧客を登録してください"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <Link key={c.id} href={`/customers/${c.id}`}
              className="card flex items-center gap-3 hover:border-[#FF2D78] transition-colors cursor-pointer">
              <div className={cn(
                "w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-white font-bold",
                c.is_vip ? "bg-gradient-to-br from-yellow-400 to-amber-500" : "bg-gradient-to-br from-pink-400 to-pink-500"
              )}>
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-[#3C4257] truncate">{c.name}</p>
                  {c.is_vip && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-400 shrink-0" />}
                </div>
                {c.kana && <p className="text-xs text-[#8792A2]">{c.kana}</p>}
                <div className="flex gap-3 mt-0.5">
                  {c.phone && (
                    <span className="flex items-center gap-0.5 text-xs text-[#8792A2]">
                      <Phone className="w-3 h-3" />{c.phone}
                    </span>
                  )}
                  <span className="text-xs text-[#8792A2]">来店 {c.visit_count}回</span>
                  <span className="text-xs text-[#FF2D78] font-medium">{formatCurrency(Number(c.total_spend))}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8792A2] shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-2xl md:rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-semibold text-[#3C4257] mb-4">{editing ? "顧客を編集" : "顧客を登録"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">お名前 *</label>
                <input className="input" placeholder="山田 太郎" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">よみがな</label>
                <input className="input" placeholder="やまだ たろう" value={form.kana} onChange={(e) => setForm({ ...form, kana: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">電話番号</label>
                <input className="input" type="tel" placeholder="090-0000-0000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">誕生日</label>
                <input className="input" type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">好み・嗜好</label>
                <textarea className="input resize-none text-sm" rows={2} placeholder="好きなお酒、よく頼むもの..." value={form.preference_notes} onChange={(e) => setForm({ ...form, preference_notes: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">NGメモ</label>
                <textarea className="input resize-none text-sm" rows={2} placeholder="苦手なもの、注意事項..." value={form.ng_notes} onChange={(e) => setForm({ ...form, ng_notes: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">メモ</label>
                <textarea className="input resize-none text-sm" rows={2} placeholder="その他メモ..." value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_vip} onChange={(e) => setForm({ ...form, is_vip: e.target.checked })} className="w-4 h-4 accent-[#FF2D78]" />
                <span className="text-sm text-[#3C4257]">VIP顧客</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-300" />
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">キャンセル</button>
              <button onClick={save} className="btn-primary flex-1">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
