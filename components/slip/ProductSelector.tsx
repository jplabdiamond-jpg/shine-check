"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { Star, Search, X } from "lucide-react";
import type { Product, ProductCategory } from "@/types/database";
import { cn } from "@/lib/utils";

interface Props {
  storeId: string;
  onSelect: (product: Product) => void;
  onClose: () => void;
}

export default function ProductSelector({ onSelect, onClose }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("favorite");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error();
      const { products: p, categories: c } = await res.json();
      setProducts(p ?? []);
      setCategories(c ?? []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredProducts = products.filter((p) => {
    if (!p.is_active) return false;
    if (search) return p.name.includes(search);
    if (activeCategory === "favorite") return p.is_favorite;
    return p.category_id === activeCategory;
  });

  const categoryTabs = [
    { id: "favorite", label: "★お気に入り", color: "#F59E0B" },
    ...categories.map((c) => ({ id: c.id, label: c.name, color: c.color })),
  ];

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/40" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="mt-auto bg-white rounded-t-2xl max-h-[85vh] flex flex-col"
        style={{ boxShadow: "0 -8px 30px rgba(0,0,0,.15)" }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#E3E8EE]">
          <h2 className="font-semibold text-[#3C4257]">商品を選択</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F6F9FC]">
            <X className="w-5 h-5 text-[#8792A2]" />
          </button>
        </div>

        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8792A2]" />
            <input className="input pl-9 text-sm" placeholder="商品名で検索..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {!search && (
          <div className="flex gap-2 px-4 pb-2 overflow-x-auto">
            {categoryTabs.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                className={cn("shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  activeCategory === cat.id ? "text-white" : "bg-[#F6F9FC] text-[#8792A2] hover:bg-[#E3E8EE]")}
                style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}>
                {cat.id === "favorite" && <Star className="w-3 h-3" />}
                {cat.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-[#8792A2]"><p className="text-sm">商品が見つかりません</p></div>
          ) : (
            <div className="grid grid-cols-3 gap-2 py-2">
              {filteredProducts.map((product) => (
                <button key={product.id} onClick={() => onSelect(product)}
                  className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-[#E3E8EE] bg-white hover:border-[#FF2D78] hover:bg-pink-50 active:scale-95 transition-all text-center min-h-[72px]">
                  <p className="text-sm font-medium text-[#3C4257] leading-tight">{product.name}</p>
                  <p className="text-xs font-bold text-[#FF2D78]">{formatCurrency(product.price)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
