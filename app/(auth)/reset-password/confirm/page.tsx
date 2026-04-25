"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [tokenError, setTokenError] = useState("");

  useEffect(() => {
    if (!token) {
      setTokenError("無効なリセットリンクです。再度パスワードリセットをリクエストしてください。");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("パスワードは8文字以上で入力してください");
      return;
    }
    if (password !== confirm) {
      toast.error("パスワードが一致しません");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "パスワードの更新に失敗しました");
        if (res.status === 400) {
          setTokenError(data.error);
        }
        return;
      }
      setDone(true);
      toast.success("パスワードを更新しました");
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      toast.error("ネットワークエラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #1A0A14 0%, #3D0A22 100%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.svg" alt="Shine Check" width={300} height={76} className="mx-auto mb-2" priority />
          <p className="text-pink-300 text-sm mt-1">夜職勘定サポート</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl" style={{ boxShadow: "0 20px 60px rgba(255,45,120,.25)" }}>
          {tokenError ? (
            <div className="text-center py-4">
              <AlertCircle className="w-12 h-12 text-[#DF1B41] mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-[#3C2233] mb-2">リンクが無効です</h2>
              <p className="text-sm text-[#A07090] mb-5 leading-relaxed">{tokenError}</p>
              <Link
                href="/reset-password"
                className="inline-block btn-primary text-center text-sm"
              >
                再度リセットをリクエスト
              </Link>
            </div>
          ) : done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-[#09825D] mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-[#3C2233] mb-2">パスワードを更新しました</h2>
              <p className="text-sm text-[#A07090] mb-4">3秒後にログイン画面へ移動します...</p>
              <Link href="/login" className="text-sm text-[#FF2D78] hover:underline font-medium">
                今すぐログイン画面へ
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-[#3C2233] mb-5">新しいパスワードを設定</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A07090] mb-1">新しいパスワード（8文字以上）</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07090]" />
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-9 pr-9"
                      placeholder="8文字以上"
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A07090]"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A07090] mb-1">パスワード確認</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07090]" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="input pl-9 pr-9"
                      placeholder="もう一度入力"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A07090]"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-[#DF1B41] mt-1">パスワードが一致しません</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="btn-primary w-full mt-2"
                >
                  {loading ? "更新中..." : "パスワードを更新する"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
