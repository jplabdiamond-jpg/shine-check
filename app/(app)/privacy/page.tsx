import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F6F9FC] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-[#8792A2] hover:text-[#FF2D78] transition-colors">
            <ChevronLeft className="w-4 h-4" />
            ダッシュボードへ戻る
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#E3E8EE] p-6">
          <h1 className="text-xl font-bold text-[#3C4257] mb-1 border-b-2 border-[#FF2D78] pb-3">
            プライバシーポリシー
          </h1>
          <p className="text-xs text-[#8792A2] mb-8">制定日：2025年4月1日</p>

          <div className="space-y-6 text-sm text-[#3C4257]">
            <section>
              <h2 className="font-bold mb-2">第1条（基本方針）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                当サービスは、ユーザーの個人情報の保護を重要な責務と考え、個人情報の保護に関する法律（個人情報保護法）を遵守し、以下のプライバシーポリシーに従って個人情報を適切に取り扱います。
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第2条（収集する情報）</h2>
              <p className="text-[#5E6F85] leading-relaxed whitespace-pre-line">
                {`当サービスでは、以下の情報を収集することがあります。
1. 氏名・メールアドレス（アカウント登録時）
2. 店舗情報・住所・電話番号（店舗ユーザー登録時）
3. 決済情報（クレジットカード情報はStripeが管理し、当社は保持しません）
4. 利用状況・アクセスログ（IPアドレス、ブラウザ情報、利用日時等）
5. お問い合わせ内容`}
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第3条（利用目的）</h2>
              <p className="text-[#5E6F85] leading-relaxed whitespace-pre-line">
                {`収集した個人情報は以下の目的に使用します。
1. サービスの提供・運営
2. ユーザー認証・アカウント管理
3. 料金の請求・決済処理
4. お問い合わせへの対応
5. サービスの改善・新機能開発
6. 利用規約違反等への対応
7. 法令上の義務の履行`}
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第4条（第三者提供）</h2>
              <p className="text-[#5E6F85] leading-relaxed whitespace-pre-line">
                {`当社は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
1. ユーザーの同意がある場合
2. 法令に基づく場合
3. 人の生命・財産の保護のために必要な場合
4. 公衆衛生の向上または児童の健全な育成の推進のために必要な場合
5. 国の機関等の法令の定める事務への協力が必要な場合`}
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第5条（外部サービスの利用）</h2>
              <p className="text-[#5E6F85] leading-relaxed whitespace-pre-line">
                {`当サービスは以下の外部サービスを利用しており、それぞれのサービスのプライバシーポリシーが適用されます。
・Neon（データベースサービス）
・Stripe（決済サービス）
・Vercel（ホスティングサービス）`}
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第6条（Cookie）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                当サービスはCookieを使用しています。Cookieはブラウザ設定から無効化することができますが、一部機能が利用できなくなる場合があります。
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第7条（セキュリティ）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                当社は、個人情報の紛失・破壊・改ざん・漏洩を防ぐため、適切なセキュリティ対策を実施します。ただし、インターネット上の通信において完全なセキュリティを保証するものではありません。
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第8条（個人情報の開示・訂正・削除）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                ユーザーは、自己の個人情報の開示・訂正・削除を当社に請求することができます。本人確認の上、合理的な期間内に対応いたします。
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第9条（未成年者について）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                当サービスは18歳以上を対象としています。未成年者の方は保護者の同意を得た上でご利用ください。
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第10条（プライバシーポリシーの変更）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                当社は、法令の変更や事業内容の変化に応じて、本プライバシーポリシーを変更することがあります。変更後のポリシーは当サービス上への掲示をもって効力を生じます。
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第11条（お問い合わせ）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                個人情報の取り扱いに関するお問い合わせは、設定画面よりご連絡ください。
              </p>
            </section>
          </div>

          <p className="mt-8 text-xs text-[#8792A2]">最終更新日：2025年4月1日</p>
        </div>
      </div>
    </div>
  );
}
