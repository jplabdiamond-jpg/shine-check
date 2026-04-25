import Link from "next/link";
import { BookOpen, Clock, ChevronRight, Sparkles } from "lucide-react";
import { articles, ALL_CATEGORIES, type ArticleCategory } from "@/lib/media/articles";

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  "はじめに":      "bg-[#FF2D78]/10 text-[#FF2D78]",
  "機能説明":      "bg-[#7B2FBE]/10 text-[#7B2FBE]",
  "使い方Tips":    "bg-[#0EA5E9]/10 text-[#0EA5E9]",
  "ユースケース":  "bg-[#09825D]/10 text-[#09825D]",
};

export const metadata = {
  title: "Media・使い方 | Shine Check",
  description: "Shine Checkの機能説明・使い方Tips・ユースケースをわかりやすく解説します。",
};

export default function MediaPage() {
  return (
    <div className="min-h-screen bg-[#FFF5F8]">
      {/* ヘッダー */}
      <div className="bg-[#1A0A14] px-4 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-[#FF6BA8]" />
          <span className="text-pink-300 text-sm font-medium tracking-widest uppercase">Media</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">使い方ガイド</h1>
        <p className="text-pink-300 text-sm max-w-md mx-auto">
          機能説明・Tips・ユースケースをわかりやすく解説します
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* カテゴリタブ */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {ALL_CATEGORIES.map((cat) => (
            <span key={cat}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[cat]}`}>
              {cat}
            </span>
          ))}
        </div>

        {/* カテゴリ別記事一覧 */}
        {ALL_CATEGORIES.map((category) => {
          const catArticles = articles.filter((a) => a.category === category);
          if (catArticles.length === 0) return null;
          return (
            <section key={category} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[category]}`}>
                  {category}
                </span>
              </div>
              <div className="space-y-3">
                {catArticles.map((article) => (
                  <Link key={article.slug} href={`/media/${article.slug}`}
                    className="flex items-start gap-3 bg-white rounded-2xl p-4 shadow-sm border border-[#FFD6E7] hover:border-[#FF2D78]/40 hover:shadow-md transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-[#FFF5F8] flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5 text-[#FF6BA8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-semibold text-[#3C2233] leading-snug mb-1 group-hover:text-[#FF2D78] transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      <p className="text-xs text-[#A07090] line-clamp-2 mb-2">
                        {article.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#A07090]">
                        <Clock className="w-3 h-3" />
                        <span>約{article.readingMinutes}分</span>
                        <span>·</span>
                        <span>{article.publishedAt}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#A07090] shrink-0 mt-1 group-hover:text-[#FF2D78] transition-colors" />
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
