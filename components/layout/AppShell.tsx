"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useAuthStore } from "@/store/authStore";
import type { StoreUser, Store } from "@/types/database";
import {
  LayoutDashboard, FileText, Table2, Package, Users, BarChart3,
  Settings, LogOut, Crown, UserCircle2, Menu, X, ChevronRight, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  storeUser: StoreUser;
  store: Store;
  children: React.ReactNode;
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "ダッシュボード" },
  { href: "/tables", icon: Table2, label: "卓管理" },
  { href: "/slips", icon: FileText, label: "伝票" },
  { href: "/products", icon: Package, label: "商品" },
  { href: "/customers", icon: UserCircle2, label: "顧客管理", premium: true },
  { href: "/casts", icon: Users, label: "キャスト", premium: true },
  { href: "/analytics", icon: BarChart3, label: "分析", premium: true },
  { href: "/media", icon: BookOpen, label: "Media・使い方" },
  { href: "/settings", icon: Settings, label: "設定" },
];

// モバイルボトムナビに常時表示する4項目
const bottomNavMain = [
  { href: "/dashboard", icon: LayoutDashboard, label: "ホーム" },
  { href: "/tables", icon: Table2, label: "卓" },
  { href: "/slips", icon: FileText, label: "伝票" },
  { href: "/products", icon: Package, label: "商品" },
];

export default function AppShell({ storeUser, store, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { setStoreUser, setStore } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setStoreUser(storeUser);
    setStore(store);
  }, [storeUser, store, setStoreUser, setStore]);

  // ページ遷移時にドロワーを閉じる
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await signOut({ redirect: false });
    toast.success("ログアウトしました");
    router.push("/login");
  }

  const isPremium = store?.plan === "premium";
  const isMenuActive = drawerOpen || navItems
    .filter((_, i) => i >= 4) // bottomNavMainにない項目
    .some(({ href }) => pathname.startsWith(href));

  return (
    <div className="flex h-screen overflow-hidden bg-[#FFF5F8]">
      {/* ===== PC サイドバー ===== */}
      <aside className="hidden md:flex flex-col w-56 bg-[#1A0A14] shrink-0">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10">
          <Image src="/logo.svg" alt="Shine Check" width={200} height={52} className="w-full max-w-[180px]" priority />
        </div>

        {/* Store name */}
        <div className="px-4 py-2 border-b border-white/10">
          <p className="text-white text-sm font-semibold truncate">{store?.name}</p>
          <div className="flex items-center gap-1">
            {isPremium
              ? <span className="flex items-center gap-0.5 text-yellow-400 text-xs"><Crown className="w-3 h-3" />Premium</span>
              : <span className="text-pink-300 text-xs">Standard</span>
            }
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label, premium }) => {
            const active = pathname.startsWith(href);
            const disabled = premium && !isPremium;
            return (
              <Link key={href} href={disabled ? "/upgrade" : href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  active ? "bg-[#FF2D78]/20 text-white" : "text-pink-200 hover:bg-white/5 hover:text-white",
                  disabled && "opacity-50"
                )}>
                <Icon className={cn("w-4 h-4 shrink-0", active && "text-[#FF6BA8]")} />
                <span>{label}</span>
                {disabled && <Crown className="w-3 h-3 ml-auto text-yellow-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#FF2D78] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-medium">{storeUser?.name?.[0] ?? "U"}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate">{storeUser?.name}</p>
              <p className="text-pink-300 text-xs">{storeUser?.role === "admin" ? "管理者" : "スタッフ"}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-pink-200 hover:text-white text-xs w-full px-2 py-1.5 rounded hover:bg-white/5 transition-colors">
            <LogOut className="w-3.5 h-3.5" />ログアウト
          </button>
        </div>
      </aside>

      {/* ===== メインコンテンツ ===== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* モバイルヘッダー */}
        <header className="md:hidden bg-[#1A0A14] px-4 py-2 flex items-center justify-between shrink-0">
          <Image src="/logo.svg" alt="Shine Check" width={160} height={40} className="h-9 w-auto" priority />
          <div className="flex items-center gap-2">
            {isPremium && <Crown className="w-3.5 h-3.5 text-yellow-400" />}
            <span className="text-pink-300 text-xs">
              {storeUser?.role === "admin" ? "管理者" : storeUser?.name}
            </span>
          </div>
        </header>

        {/* コンテンツ */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* ===== モバイルボトムナビ ===== */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#FFD6E7] flex z-50"
          style={{ boxShadow: "0 -2px 10px rgba(255,45,120,.12)" }}>
          {bottomNavMain.map(({ href, icon: Icon, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                  active ? "text-[#FF2D78]" : "text-[#A07090]"
                )}>
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </Link>
            );
          })}
          {/* もっと見る */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors",
              isMenuActive ? "text-[#FF2D78]" : "text-[#A07090]"
            )}>
            <Menu className="w-5 h-5" />
            <span>メニュー</span>
          </button>
        </nav>
      </div>

      {/* ===== モバイルドロワーメニュー ===== */}
      {drawerOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-[70]"
            onClick={() => setDrawerOpen(false)}
          />
          {/* ドロワー本体（下から） */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-[80] bg-white rounded-t-2xl shadow-2xl"
            style={{ maxHeight: "85vh" }}>
            {/* ドロワーヘッダー */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#FFD6E7]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FF2D78] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-medium">{storeUser?.name?.[0] ?? "U"}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#3C2233]">{storeUser?.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#A07090]">{storeUser?.role === "admin" ? "管理者" : "スタッフ"}</span>
                    {isPremium
                      ? <span className="flex items-center gap-0.5 text-yellow-500 text-xs font-medium"><Crown className="w-3 h-3" />Premium</span>
                      : <span className="text-xs text-[#A07090]">Standard</span>
                    }
                  </div>
                </div>
              </div>
              <button onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-full hover:bg-[#FFF5F8]">
                <X className="w-5 h-5 text-[#A07090]" />
              </button>
            </div>

            {/* ナビ一覧 */}
            <div className="overflow-y-auto" style={{ maxHeight: "calc(85vh - 140px)" }}>
              <div className="px-4 py-3 space-y-1">
                {navItems.map(({ href, icon: Icon, label, premium }) => {
                  const active = pathname.startsWith(href);
                  const disabled = premium && !isPremium;
                  return (
                    <Link
                      key={href}
                      href={disabled ? "/upgrade" : href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors",
                        active
                          ? "bg-[#FF2D78] text-white"
                          : "text-[#3C2233] hover:bg-[#FFF5F8]",
                        disabled && "opacity-60"
                      )}>
                      <Icon className={cn("w-5 h-5 shrink-0", active ? "text-white" : "text-[#A07090]")} />
                      <span className="flex-1">{label}</span>
                      {disabled && (
                        <span className="flex items-center gap-0.5 text-xs text-yellow-500 font-medium">
                          <Crown className="w-3 h-3" />PRO
                        </span>
                      )}
                      {!disabled && !active && (
                        <ChevronRight className="w-4 h-4 text-[#A07090]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ログアウト */}
            <div className="px-4 py-4 border-t border-[#FFD6E7]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-[#DF1B41] hover:bg-red-50 transition-colors">
                <LogOut className="w-5 h-5" />
                ログアウト
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
