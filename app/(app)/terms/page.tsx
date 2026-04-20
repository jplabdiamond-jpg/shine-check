import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
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
            利用規約
          </h1>
          <p className="text-xs text-[#8792A2] mb-8">制定日：2025年4月1日</p>

          <div className="space-y-6 text-sm text-[#3C4257]">
            <section>
              <h2 className="font-bold mb-2">第1条（適用）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                本利用規約（以下「本規約」）は、当サービスの利用に関する条件を、ユーザーと当サービス運営者（以下「当社」）との間で定めるものです。ユーザーは本規約に同意の上、当サービスをご利用ください。
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第2条（定義）</h2>
              <p className="text-[#5E6F85] leading-relaxed whitespace-pre-line">
                {`本規約において使用する用語の定義は以下のとおりです。
・「ユーザー」：当サービスを利用するすべての方（店舗・スタッフを含む）
・「店舗ユーザー」：当サービスを契約・利用する店舗・事業者
・「スタッフ」：店舗ユーザーに登録されたスタッフアカウント利用者`}
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第3条（利用登録）</h2>
              <p className="text-[#5E6F85] leading-relaxed whitespace-pre-line">
                {`1. 登録を希望する方は、本規約に同意の上、当社所定の方法により利用登録の申請を行ってください。
2. 当社は、登録申請者が以下の事由に該当すると判断した場合、登録を拒否することがあります。
  （1）過去に本規約違反等により登録を取り消された方
  （2）虚偽の情報を提供した場合
  （3）その他当社が不適切と判断した場合`}
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第4条（禁止事項）</h2>
              <p className="text-[#5E6F85] leading-relaxed whitespace-pre-line">
                {`ユーザーは、以下の行為を行ってはなりません。
1. 法令または公序良俗に違反する行為
2. 虚偽・不正確な情報の入力・提供
3. 当サービスのサーバーへの過度な負荷をかける行為
4. 他のユーザーへの迷惑行為・嫌がらせ
5. 当サービスのシステムへの不正アクセス
6. 当社および第三者の知的財産権を侵害する行為
7. 反社会的勢力への利益供与
8. その他当社が不適切と判断する行為`}
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第5条（料金・支払い）</h2>
              <p className="text-[#5E6F85] leading-relaxed whitespace-pre-line">
                {`1. 有料プランの利用料金は当社が別途定める料金表に従います。
2. 月額料金は毎月同日に自動決済されます。
3. 決済が失敗した場合、有料サービスの提供が停止されることがあります。
4. お支払い済みの料金は、原則として返金しないものとします。`}
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第6条（サービスの変更・停止）</h2>
              <p className="text-[#5E6F85] leading-relaxed whitespace-pre-line">
                {`1. 当社は、ユーザーへの事前通知なしに、当サービスの内容を変更または停止できるものとします。
2. 当社はこれによってユーザーに生じた損害について、一切の責任を負いません。`}
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第7条（免責事項）</h2>
              <p className="text-[#5E6F85] leading-relaxed whitespace-pre-line">
                {`1. 当社は、当サービスに関してユーザーに生じた損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。
2. 当社は、ユーザー同士または店舗とスタッフの間で生じたトラブルに一切関与せず、責任を負いません。`}
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第8条（個人情報の取扱い）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                当社は、ユーザーの個人情報を「プライバシーポリシー」に従って適切に取り扱います。
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第9条（規約の変更）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                当社は、必要と判断した場合に本規約を変更できるものとします。変更後の規約は当サービス上に掲示した時点から効力を有するものとします。
              </p>
            </section>

            <section>
              <h2 className="font-bold mb-2">第10条（準拠法・裁判管轄）</h2>
              <p className="text-[#5E6F85] leading-relaxed">
                本規約の解釈は日本法に準拠するものとします。当サービスに関して紛争が生じた場合は、当社所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。
              </p>
            </section>
          </div>

          <p className="mt-8 text-xs text-[#8792A2]">最終更新日：2025年4月1日</p>
        </div>
      </div>
    </div>
  );
}
