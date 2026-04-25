"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("メールアドレスまたはパスワードが違います");
      } else {
        toast.success("ログインしました");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #1A0A14 0%, #3D0A22 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.svg" alt="Shine Check" width={300} height={76} className="mx-auto mb-2" priority />
          <p className="text-pink-300 text-sm mt-1">夜職勘定サポート</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-2xl" style={{ boxShadow: "0 20px 60px rgba(255,45,120,.25)" }}>
          <h2 className="text-lg font-semibold text-[#3C2233] mb-5">ログイン</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A07090] mb-1">メールアドレス</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07090]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input pl-9" placeholder="store@example.com" required autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A07090] mb-1">パスワード</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07090]" />
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-9 pr-9" placeholder="••••••" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A07090]">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-[#FFD6E7] text-center space-y-2">
            <a href="/reset-password" className="block text-sm text-[#A07090] hover:text-[#FF2D78] hover:underline">
              パスワードをお忘れの方
            </a>
            <a href="/register" className="block text-sm text-[#FF2D78] hover:underline">新規店舗登録はこちら</a>
          </div>
        </div>
      </div>
    </div>
  );
}
