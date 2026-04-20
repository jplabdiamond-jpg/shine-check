"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ storeName: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error("パスワードが一致しません"); return; }
    if (form.password.length < 6) { toast.error("パスワードは6文字以上です"); return; }
    setLoading(true);
    try {
      // 1. APIで登録
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName: form.storeName, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "登録に失敗しました");

      // 2. 自動ログイン
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (result?.error) throw new Error("ログインに失敗しました");

      toast.success("登録完了！");
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "linear-gradient(135deg, #1A0A14 0%, #3D0A22 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Image src="/logo.svg" alt="Shine Check" width={280} height={70} className="mx-auto mb-2" priority />
          <h1 className="text-white text-xl font-semibold">店舗新規登録</h1>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-2xl" style={{ boxShadow: "0 20px 60px rgba(255,45,120,.25)" }}>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A07090] mb-1">店舗名</label>
              <input className="input" placeholder="例：Club Diamond" required
                value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A07090] mb-1">メールアドレス</label>
              <input type="email" className="input" placeholder="store@example.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A07090] mb-1">パスワード（6文字以上）</label>
              <input type="password" className="input" placeholder="6文字以上" minLength={6} required
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A07090] mb-1">パスワード確認</label>
              <input type="password" className="input" placeholder="再入力" required
                value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            </div>
            <div className="bg-pink-50 rounded-lg p-3 text-xs text-pink-700">
              <p className="font-medium mb-1">スタンダードプランで開始（現在テスト中のため無料）</p>
              <p>・1日15枚まで伝票作成</p>
              <p>・基本機能すべて利用可能</p>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "登録中..." : "無料で始める"}
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/login" className="text-sm text-[#A07090] hover:text-[#FF2D78]">既にアカウントをお持ちの方</a>
          </div>
        </div>
      </div>
    </div>
  );
}
