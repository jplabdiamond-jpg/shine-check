"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/lib/utils";
import { Plus, Star, Edit2, Trash2, Package, Crown } from "lucide-react";
import toast from "react-hot-toast";
import type { Product, ProductCategory } from "@/types/database";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const { store, isAdmin } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", price: "", category_id: "", is_favorite: false });

  const fetchData = useCallback(async () => {
    if (!store?.id) return;
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      const { products: p, categories: c } = await res.json();
      setProducts(p ?? []);
      setCategories(c ?? []);
    } catch {
      toast.error("読み込みに失敗しました");
    }
  }, [store?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openNew() {
    setEditing(null);
    setForm({ name: "", price: "", category_id: categories[0]?.id ?? "", is_favorite: false });
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), category_id: p.category_id ?? "", is_favorite: p.is_favorite });
    setShowModal(true);
  }

  const FREE_LIMIT = 10;
  const isPremium = store?.plan === "premium";
  const atLimit = !isPremium && products.length >= FREE_LIMIT;

  async function save() {
    if (!form.name || !form.price) { toast.error("名前と価格は必須です"); return; }
    try {
      const payload = { name: form.name, price: Number(form.price), category_id: form.category_id || null, is_favorite: form.is_favorite };
      const res = await fetch("/api/products", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing ? { ...payload, id: editing.id } : payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "PLAN_LIMIT") {
          toast.error(data.message ?? "商品数の上限に達しました");
        } else {
          toast.error("保存に失敗しました");
        }
        return;
      }
      toast.success(editing ? "更新しました" : "追加しました");
      setShowModal(false);
      fetchData();
    } catch {
      toast.error("保存に失敗しました");
    }
  }

  async function toggleFavorite(p: Product) {
    await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, name: p.name, price: p.price, category_id: p.category_id, is_favorite: !p.is_favorite }),
    });
    fetchData();
  }

  async function deleteProduct(p: Product) {
    if (!confirm(`${p.name}を削除しますか？`)) return;
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id }),
    });
    toast.success("削除しました");
    fetchData();
  }

  const filtered = products.filter((p) => p.is_active && (activeCategory === "all" || p.category_id === activeCategory));

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[#3C4257]">商品マスタ</h1>
        {isAdmin() && (
          <button
            onClick={atLimit ? undefined : openNew}
            disabled={atLimit}
            className={cn("flex items-center gap-1.5", atLimit ? "btn-secondary opacity-50 cursor-not-allowed" : "btn-primary")}
          >
            <Plus className="w-4 h-4" />追加
          </button>
        )}
      </div>

      {/* 無料プラン制限バナー */}
      {!isPremium && (
        <div className={cn(
          "flex items-center gap-3 rounded-xl px-4 py-3 mb-4 text-sm",
          atLimit
            ? "bg-amber-50 border border-amber-200 text-amber-800"
            : "bg-[#FFF0F5] border border-[#FFD6E7] text-[#FF2D78]"
        )}>
          <Crown className="w-4 h-4 shrink-0" />
          {atLimit ? (
            <span>
              商品数が上限（{FREE_LIMIT}件）に達しました。
              <strong className="ml-1">プレミアムプランにアップグレード</strong>すると無制限に追加できます。
            </span>
          ) : (
            <span>無料プランは商品を最大 <strong>{FREE_LIMIT}件</strong> まで登録できます（現在 {products.length} 件）</span>
          )}
        </div>
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setActiveCategory("all")}
          className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium",
            activeCategory === "all" ? "bg-[#FF2D78] text-white" : "bg-white border border-[#E3E8EE] text-[#8792A2]")}>
          すべて
        </button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)}
            className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium",
              activeCategory === c.id ? "text-white" : "bg-white border border-[#E3E8EE] text-[#8792A2]")}
            style={activeCategory === c.id ? { backgroundColor: c.color } : {}}>
            {c.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#8792A2]">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>商品がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map((p) => {
            const cat = categories.find((c) => c.id === p.category_id);
            return (
              <div key={p.id} className="card relative">
                {cat && (
                  <span className="absolute top-2 left-2 text-xs px-1.5 py-0.5 rounded font-medium text-white"
                    style={{ backgroundColor: cat.color }}>{cat.name}</span>
                )}
                <div className="mt-5">
                  <p className="font-medium text-[#3C4257] text-sm">{p.name}</p>
                  <p className="text-lg font-bold text-[#FF2D78] mt-1">{formatCurrency(p.price)}</p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E3E8EE]">
                  <button onClick={() => toggleFavorite(p)}>
                    <Star className={cn("w-4 h-4", p.is_favorite ? "fill-amber-400 text-amber-400" : "text-gray-300")} />
                  </button>
                  {isAdmin() && (
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}><Edit2 className="w-4 h-4 text-[#8792A2] hover:text-[#FF2D78]" /></button>
                      <button onClick={() => deleteProduct(p)}><Trash2 className="w-4 h-4 text-[#8792A2] hover:text-[#DF1B41]" /></button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white w-full max-w-sm rounded-t-2xl md:rounded-2xl p-6 shadow-2xl">
            <h2 className="font-semibold text-[#3C4257] mb-4">{editing ? "商品を編集" : "商品を追加"}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">商品名 *</label>
                <input className="input" placeholder="例：ビール" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">価格（円）*</label>
                <input type="number" className="input" placeholder="800" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs text-[#8792A2] mb-1">カテゴリ</label>
                <select className="input" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">なし</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_favorite} onChange={(e) => setForm({ ...form, is_favorite: e.target.checked })} className="w-4 h-4 accent-[#FF2D78]" />
                <span className="text-sm text-[#3C4257]">お気に入りに追加</span>
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
