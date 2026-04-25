"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "送信に失敗しました");
        return;
      }
      setSent(true);
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
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-[#09825D] mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-[#3C2233] mb-2">メールを送信しました</h2>
              <p className="text-sm text-[#A07090] mb-4 leading-relaxed">
                <strong className="text-[#3C2233]">{email}</strong> に<br />
                パスワードリセット用のリンクを送信しました。<br />
                メールをご確認ください。
              </p>
              <p className="text-xs text-[#A07090] mb-5">
                ※ 届かない場合は迷惑メールフォルダをご確認ください。<br />
                ※ リンクの有効期限は1時間です。
              </p>
              <Link href="/login" className="text-sm text-[#FF2D78] hover:underline font-medium">
                ログイン画面に戻る
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-5">
                <Link href="/login" className="text-[#A07090] hover:text-[#FF2D78] transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h2 className="text-lg font-semibold text-[#3C2233]">パスワードをお忘れですか？</h2>
              </div>
              <p className="text-sm text-[#A07090] mb-5 leading-relaxed">
                登録済みのメールアドレスを入力してください。<br />
                パスワードリセット用のリンクをお送りします。
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#A07090] mb-1">メールアドレス</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A07090]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input pl-9"
                      placeholder="store@example.com"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? "送信中..." : "リセットメールを送信"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
