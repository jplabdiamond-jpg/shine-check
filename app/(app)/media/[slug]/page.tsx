import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Tag, BookOpen } from "lucide-react";
import { getArticle, articles, type ArticleCategory } from "@/lib/media/articles";
import type { Metadata } from "next";

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  "はじめに":      "bg-[#FF2D78]/10 text-[#FF2D78]",
  "機能説明":      "bg-[#7B2FBE]/10 text-[#7B2FBE]",
  "使い方Tips":    "bg-[#0EA5E9]/10 text-[#0EA5E9]",
  "ユースケース":  "bg-[#09825D]/10 text-[#09825D]",
};

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = getArticle(params.slug);
  if (!article) return {};
  return {
    title: `${article.title} | Shine Check`,
    description: article.description,
  };
}

export default function ArticlePage({ params }: Props) {
  const article = getArticle(params.slug);
  if (!article) notFound();
  // notFound() throws, so article is defined below
  const a = article!;

  // 関連記事（同カテゴリ、自分以外）
  const related = articles
    .filter((r) => r.category === a.category && r.slug !== a.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FFF5F8]">
      {/* ヘッダー */}
      <div className="bg-[#1A0A14] px-4 py-4">
        <Link href="/media"
          className="inline-flex items-center gap-1.5 text-pink-300 hover:text-white text-sm transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span>使い方ガイドに戻る</span>
        </Link>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${CATEGORY_COLORS[a.category]}`}
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#FF6BA8" }}>
            <Tag className="w-3 h-3 inline mr-1" />
            {a.category}
          </span>
        </div>
        <h1 className="text-lg font-bold text-white leading-snug mb-2">
          {a.title}
        </h1>
        <div className="flex items-center gap-3 text-pink-300 text-xs">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />約{a.readingMinutes}分</span>
          <span>·</span>
          <span>{a.publishedAt}</span>
        </div>
      </div>

      {/* 本文 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: a.content }}
        />

        {/* 関連記事 */}
        {related.length > 0 && (
          <div className="mt-10 pt-6 border-t border-[#FFD6E7]">
            <h3 className="text-sm font-semibold text-[#A07090] mb-3">同じカテゴリの記事</h3>
            <div className="space-y-2">
              {related.map((a) => (
                <Link key={a.slug} href={`/media/${a.slug}`}
                  className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-[#FFD6E7] hover:border-[#FF2D78]/40 transition-all group">
                  <BookOpen className="w-4 h-4 text-[#FF6BA8] shrink-0" />
                  <span className="text-sm text-[#3C2233] group-hover:text-[#FF2D78] transition-colors line-clamp-1">
                    {a.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 一覧に戻る */}
        <div className="mt-6 text-center">
          <Link href="/media"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF2D78] text-white text-sm font-medium rounded-full hover:bg-[#E0195F] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
