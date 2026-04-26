export type ArticleCategory = "はじめに" | "機能説明" | "使い方Tips" | "ユースケース";

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: ArticleCategory;
  publishedAt: string; // YYYY-MM-DD
  readingMinutes: number;
  content: string; // HTML文字列
}

export const articles: Article[] = [
  {
    slug: "getting-started",
    title: "Shine Check をはじめよう — 初期設定から最初の伝票まで",
    description: "アカウント登録・店舗設定・テーブル作成・最初の伝票発行まで5分でわかるスタートガイドです。",
    category: "はじめに",
    publishedAt: "2026-04-25",
    readingMinutes: 5,
    content: `
<h2>1. アカウント登録</h2>
<p>トップページの「無料で始める」ボタンからメールアドレス・パスワード・店舗名を入力して登録します。登録直後はStandardプランで利用開始できます。</p>
<div class="article-img-box">
  <img src="/blog/sc_login.webp" alt="Shine Checkログイン画面" loading="lazy" />
  <p class="article-img-caption">Shine Checkログイン画面</p>
</div>


<h2>2. 店舗設定</h2>
<p>ログイン後、<strong>設定 → 店舗情報</strong> から以下を設定してください。</p>
<ul>
  <li>消費税率（例：10%）</li>
  <li>サービス料率（例：15%）</li>
  <li>税・サービス料の計算方式（内税/外税）</li>
  <li>セット時間・延長時間のデフォルト値</li>
</ul>
<div class="article-img-box">
  <img src="/blog/sc_store_settings.webp" alt="店舗設定画面：消費税・サービス料・セット延長設定" loading="lazy" />
  <p class="article-img-caption">店舗設定画面：消費税・サービス料・セット延長設定</p>
</div>

<h2>3. テーブル（卓）を追加する</h2>
<p><strong>卓管理 → ＋卓を追加</strong> から卓名を登録します。「VIP-1」「BOX-A」など自由に命名できます。</p>

<h2>4. 最初の伝票を発行</h2>
<ol>
  <li>卓管理から空き卓をタップ</li>
  <li>「伝票を開く」をタップ</li>
  <li>人数・セット内容を入力してスタート</li>
  <li>タイマーが自動で動き始めます</li>
</ol>

<div class="tip-box">
  <strong>💡 Tip</strong><br>
  設定で「セットデフォルト時間」を先に決めておくと、伝票開票時に自動入力されるので便利です。
</div>
<div class="article-img-box">
  <img src="/blog/sc_account.webp" alt="アカウント情報・権限確認画面" loading="lazy" />
  <p class="article-img-caption">アカウント情報・権限確認画面</p>
</div>

    
<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },
  {
    slug: "timer-usage",
    title: "タイマー機能の使い方 — 自動延長・手動延長を使いこなす",
    description: "セット時間・延長管理をスマートにこなすタイマー機能の詳細解説。閉店後精算でのポイントも紹介。",
    category: "機能説明",
    publishedAt: "2026-04-25",
    readingMinutes: 4,
    content: `
<h2>タイマーのしくみ</h2>
<p>伝票を開いた瞬間からセットタイマーがスタートします。設定した「セット時間（分）」のカウントダウンが画面上に表示されます。</p>
<div class="article-img-box">
  <img src="/blog/sc_timer_set.webp" alt="セット時間設定：60分・90分・120分から選択" loading="lazy" />
  <p class="article-img-caption">セット時間設定：60分・90分・120分から選択</p>
</div>


<h2>延長の追加</h2>
<p>タイマー満了前後に「延長を追加」ボタンから延長料金を計上できます。延長は何回でも追加可能で、回数も記録されます。</p>
<div class="article-img-box">
  <img src="/blog/sc_timer_extend.webp" alt="延長設定：30分・60分単位で設定可能" loading="lazy" />
  <p class="article-img-caption">延長設定：30分・60分単位で設定可能</p>
</div>


<h2>手動でのセット時間変更</h2>
<p>伝票詳細画面のタイマーアイコンをタップすると、セット時間・延長時間を手動で変更できます。イレギュラーな対応にも柔軟に対応できます。</p>

<div class="tip-box">
  <strong>💡 Tip</strong><br>
  延長料金のデフォルト値は設定から変更できます。キャバクラ・ラウンジなど業態に合わせて調整しましょう。
</div>

<h2>精算時の確認</h2>
<p>伝票クローズ時に「セット×回数」「延長×回数」「ドリンクバック対象商品」が一覧で表示されます。金額の二重確認が簡単にできます。</p>
    
<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },
  {
    slug: "daily-close",
    title: "営業終了処理の手順 — 日次集計を正確に締める",
    description: "1日の営業終了時に行う「営業締め」処理の正しい手順と注意点を解説します。",
    category: "使い方Tips",
    publishedAt: "2026-04-25",
    readingMinutes: 3,
    content: `
<h2>営業終了処理とは</h2>
<p>ダッシュボードの「営業終了」ボタンを押すと、その日の売上・伝票数・顧客数が確定（ロック）されます。締め後はダッシュボードの当日集計が¥0表示になり、新規伝票は翌日分として計上されます。</p>

<h2>手順</h2>
<ol>
  <li>全テーブルの伝票がクローズ済みか確認</li>
  <li>ダッシュボード右上の「営業終了」ボタンをタップ</li>
  <li>確認ダイアログで「締める」を選択</li>
  <li>当日売上サマリーが表示されます</li>
</ol>

<div class="tip-box">
  <strong>⚠️ 注意</strong><br>
  営業終了処理は取り消せません。未精算の伝票が残っていないか必ず確認してから実行してください。
</div>

<h2>日付の切り替わり（AM3時基準）</h2>
<p>Shine Checkは深夜3時を1日の区切りとしています。0〜2時台に発行した伝票は前日の営業分として扱われます。夜間営業の実態に合わせた設計です。</p>
    
<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },
  {
    slug: "cast-management",
    title: "キャスト管理機能 — バック計算・出退勤を自動化",
    description: "Premiumプランで使えるキャスト管理機能。ドリンクバック・指名バック・同伴バックの自動集計方法を解説。",
    category: "機能説明",
    publishedAt: "2026-04-25",
    readingMinutes: 5,
    content: `
<div class="tip-box" style="background:#FFF9E6;border-color:#F5C518;">
  <strong>👑 Premiumプラン機能</strong><br>
  キャスト管理はPremiumプランでご利用いただけます。
</div>

<h2>キャストの登録</h2>
<p><strong>キャスト → ＋追加</strong> から登録します。設定できる項目：</p>
<ul>
  <li>源氏名・本名</li>
  <li>時給</li>
  <li>ドリンクバック率（%）</li>
  <li>指名バック率（%）</li>
  <li>同伴バック率（%）</li>
  <li>延長バック率（%）</li>
</ul>

<h2>バックの自動計算</h2>
<p>伝票にキャストを紐付けると、クローズ時に各バック金額が自動計算されます。分析画面のキャスト別集計でも確認できます。</p>

<h2>出退勤管理</h2>
<p>キャスト一覧から「出勤」ボタンをタップするだけで出退勤を記録できます。時給計算のベースデータになります。</p>

<div class="tip-box">
  <strong>💡 Tip</strong><br>
  ドリンクバック率はキャスト個別に設定できます。新人は低め、ベテランは高めに設定するなど柔軟に対応できます。
</div>
    
<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },
  {
    slug: "kyabakura-usecase",
    title: "キャバクラ店での活用例 — 10卓・スタッフ5名の現場から",
    description: "実際のキャバクラ運営を想定した具体的な使い方シナリオ。ボトルキープ管理・指名料の計上方法も紹介。",
    category: "ユースケース",
    publishedAt: "2026-04-25",
    readingMinutes: 6,
    content: `
<h2>店舗概要（想定）</h2>
<ul>
  <li>席数：10卓</li>
  <li>スタッフ：マネージャー1名 + ホール4名</li>
  <li>セット：60分 ¥5,000</li>
  <li>延長：30分 ¥2,500</li>
</ul>

<h2>ピーク時の流れ</h2>
<p>20時の開店と同時にホールスタッフ全員がShine Checkにログイン。各自のスマートフォンから担当卓の伝票を開きます。</p>

<h3>入店時</h3>
<ol>
  <li>卓管理 → 空き卓をタップ → 「伝票を開く」</li>
  <li>人数・指名キャスト名を入力</li>
  <li>セット開始 → タイマー自動スタート</li>
</ol>

<h3>オーダー時</h3>
<p>伝票画面 → 「＋商品追加」からドリンク・フードをその場で入力。商品マスタに登録済みの商品はワンタップで追加できます。</p>

<h3>精算時</h3>
<ol>
  <li>伝票クローズ → 合計金額を確認</li>
  <li>支払方法（現金/カード）を選択</li>
  <li>レシートをプリント or 画面提示</li>
</ol>

<div class="tip-box">
  <strong>💡 ボトルキープのTip</strong><br>
  ボトルキープは商品マスタに「ボトルキープ（キープ料込）」として登録し、単価0円・備考欄にボトル名を記録する運用が一般的です。
</div>

<h2>日締め後の確認</h2>
<p>分析画面で当日の売上・キャスト別バック・商品別売上を一覧確認。翌日の発注や給与計算の基礎データとして活用できます。</p>
    
<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },
  {
    slug: "analytics-tips",
    title: "分析機能の使い方 — 売上トレンドとキャスト貢献度を読む",
    description: "Premiumプランの分析ダッシュボードで売上改善につながるデータの読み方を解説します。",
    category: "使い方Tips",
    publishedAt: "2026-04-25",
    readingMinutes: 4,
    content: `
<div class="tip-box" style="background:#FFF9E6;border-color:#F5C518;">
  <strong>👑 Premiumプラン機能</strong><br>
  分析機能はPremiumプランでご利用いただけます。
</div>

<h2>売上トレンドグラフ</h2>
<p>過去30日間の日次売上をグラフで確認できます。曜日別の傾向を読んでシフト調整や集客施策に活用しましょう。</p>

<h2>キャスト別集計</h2>
<p>指名数・ドリンクバック・時間帯別パフォーマンスをキャストごとに確認できます。モチベーション管理や給与計算の根拠データになります。</p>

<h2>商品別売上</h2>
<p>ドリンク・フードそれぞれの売上ランキングを確認。売れていない商品の整理や人気商品の在庫確保に役立てましょう。</p>

<div class="tip-box">
  <strong>💡 Tip</strong><br>
  週次でレビューする習慣をつけると、売上の変化に素早く対応できます。毎週月曜の開店前に5分確認するだけで経営の見通しが大きく変わります。
</div>
    
<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事7 =====
  {
    slug: "slip-management",
    title: "伝票管理を徹底解説 — 開票・商品追加・精算の完全ガイド",
    description: "伝票の開票から精算完了まで、全操作をスクリーンショット付きで丁寧に解説します。",
    category: "機能説明",
    publishedAt: "2026-04-25",
    readingMinutes: 6,
    content: `
<p>Shine Check の中核機能である<strong>伝票管理</strong>を、開票から精算まで順を追って解説します。伝票の流れを理解することで、日々の会計業務が格段にスムーズになります。</p>

<hr/>

<h2>伝票を開く（開票）</h2>

<p>卓管理画面で空き卓をタップし、<strong>「伝票を開く」</strong>ボタンを押すと伝票が発行されます。開票時に入力する項目は以下の通りです。</p>
<ul>
  <li><strong>人数</strong>：料金計算の基準になります</li>
  <li><strong>セット内容</strong>：設定済みのセットメニューから選択</li>
  <li><strong>担当キャスト</strong>：複数指定も可能</li>
  <li><strong>来店目的メモ</strong>：任意入力</li>
</ul>

<div class="article-img-box">
  <img src="/blog/sc_slip_new.webp" alt="開票画面：卓選択 → 伝票オープン → 入力フォーム" loading="lazy" />
  <p class="article-img-caption">開票画面：卓選択 → 伝票オープン → 入力フォーム</p>
</div>

<hr/>

<h2>商品・ドリンクを追加する</h2>

<p>伝票が開いた状態で<strong>「商品を追加」</strong>ボタンをタップすると、登録済み商品一覧が表示されます。数量を指定してタップするだけで伝票に自動反映されます。カテゴリ絞り込みも使えるので、混雑した時間帯でも素早く入力できます。</p>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  よく頼まれる商品は「お気に入り登録」しておくと一覧上部に固定表示されて便利です。
</div>

<div class="article-img-box">
  <img src="/blog/sc_slip_detail.webp" alt="商品追加画面：カテゴリ絞り込み → 数量入力 → 伝票反映" loading="lazy" />
  <p class="article-img-caption">商品追加画面：カテゴリ絞り込み → 数量入力 → 伝票反映</p>
</div>

<hr/>

<h2>料金計算の仕組み</h2>

<p>料金は以下の順で自動計算されます。</p>
<ol>
  <li>セット料金 × 人数</li>
  <li>延長料金（タイマー超過時は自動加算）</li>
  <li>商品合計</li>
  <li>サービス料（設定値 %）</li>
  <li>消費税（設定値 %）</li>
</ol>

<p>税・サービス料の計算方式（内税/外税）は設定画面で切り替え可能です。伝票画面右上の<strong>「料金内訳」</strong>をタップすれば明細が展開されます。</p>

<hr/>

<h2>精算する</h2>

<p>精算は伝票下部の<strong>「精算する」</strong>ボタンから行います。支払い方法（現金・カード・その他）を選択し、実際の受取金額を入力するとお釣り計算も自動で表示されます。精算完了と同時に日次売上にリアルタイム反映されます。</p>

<div class="article-img-box">
  <img src="/blog/sc_slip_list2.webp" alt="精算画面：支払い方法選択 → 金額入力 → 確定ボタン" loading="lazy" />
  <p class="article-img-caption">精算画面：支払い方法選択 → 金額入力 → 確定ボタン</p>
</div>

<hr/>

<h2>伝票を修正・再オープンする</h2>

<p>精算済み伝票を間違えた場合は<strong>伝票履歴</strong>から対象を選び「再オープン」が可能です（当日分のみ・マネージャー以上の権限が必要）。修正後に再精算するだけで日次売上にも正しく反映されます。</p>

<div class="tip-box">
  <strong>⚠️ 注意</strong><br/>
  翌日以降に発覚したミスは管理者権限で「売上修正」メニューから対応してください。一般スタッフには表示されません。
</div>

<hr/>

<h2>よくある質問</h2>

<p><strong>Q. 伝票を誤って閉じてしまいました</strong><br/>
A. 卓管理の「処理中」タブに残っています。タップして再開できます。</p>

<p><strong>Q. 複数テーブルを合算精算したい</strong><br/>
A. 各伝票を「合算対象」に指定し、代表伝票から一括精算が可能です。合計金額と内訳が自動でまとまります。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事8 =====
  {
    slug: "table-management",
    title: "卓管理機能ガイド — 空き状況の把握からテーブル割り振りまで",
    description: "リアルタイムに卓の空き・使用中・精算待ちを把握できる卓管理機能の全操作を解説します。",
    category: "機能説明",
    publishedAt: "2026-04-25",
    readingMinutes: 5,
    content: `
<p><strong>卓管理</strong>は店舗運営のコントロールタワーです。すべての卓の状態をリアルタイムで把握し、スタッフ全員がスマートフォンから確認できます。紙の卓台帳や口頭確認から解放されましょう。</p>

<hr/>

<h2>卓のステータス表示</h2>

<p>卓カードは状態によって色が変化します。一目で全体状況が把握できます。</p>
<ul>
  <li>🟢 <strong>空き（グリーン）</strong>：利用可能な卓</li>
  <li>🔴 <strong>使用中（レッド）</strong>：現在お客様がいる卓（経過時間も表示）</li>
  <li>🟡 <strong>精算待ち（イエロー）</strong>：精算処理中の卓</li>
  <li>⚫ <strong>クローズ（グレー）</strong>：本日使用しない卓</li>
</ul>

<div class="screenshot-box">
  📸 <em>卓管理一覧：ステータスカラーと経過時間表示</em>
</div>

<hr/>

<h2>卓を追加・編集する</h2>

<p><strong>卓管理 → ＋卓を追加</strong>から新しい卓を登録できます。設定項目は以下です。</p>
<ul>
  <li>卓名（例：VIP-1、BOX-A、カウンター1）</li>
  <li>定員（最大人数）</li>
  <li>並び順（ドラッグで変更可）</li>
  <li>メモ（例：禁煙、窓側など）</li>
</ul>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  「並び順」は実際の店内レイアウトに合わせると、スタッフが直感的に操作できます。入口に近い卓を上に並べると案内もスムーズです。
</div>

<hr/>

<h2>セット変更・担当キャスト変更</h2>

<p>営業中に席種を変更したい場合は、対象卓の伝票から<strong>「セット変更」</strong>をタップします。変更前後の金額差が自動調整されます。担当キャストを途中交代する場合も同様に伝票から変更でき、各キャストの在席時間がログに残ります。</p>

<div class="screenshot-box">
  📸 <em>担当キャスト変更画面：複数選択・時間帯ログ</em>
</div>

<hr/>

<h2>テーブル合算精算</h2>

<p>複数テーブルを一人のお客様が利用している場合、<strong>合算精算</strong>が使えます。合算したい卓を長押し選択し「合算精算」をタップするだけで合計金額が表示されます。団体客の会計や「あちらのテーブルも一緒に」という場面で活躍します。</p>

<hr/>

<h2>卓の利用状況を分析に活かす</h2>

<p>経営者・マネージャーは<strong>分析 → 卓別売上</strong>から、どの卓が最も売上に貢献しているか確認できます。稼働率が低い卓はレイアウト変更や用途変更の判断材料になります。VIP席の稼働率が低い場合は、最低料金設定の見直しも検討しましょう。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事9 =====
  {
    slug: "product-management",
    title: "商品・ドリンクメニュー管理 — 登録から価格変更・在庫管理まで",
    description: "メニュー登録・カテゴリ分類・価格改定・在庫フラグの設定方法を詳しく解説します。",
    category: "機能説明",
    publishedAt: "2026-04-25",
    readingMinutes: 5,
    content: `
<p>Shine Check では<strong>商品・ドリンクメニュー</strong>を自由に登録・編集できます。カテゴリ分類から価格改定まで、すべてアプリ上で完結します。手書きメニュー表の更新や印刷コストからも解放されます。</p>

<hr/>

<h2>商品を登録する</h2>

<p><strong>商品管理 → ＋商品追加</strong>から登録できます。入力項目は以下です。</p>
<ul>
  <li><strong>商品名</strong>（例：シャンパン A、ウイスキーボトル）</li>
  <li><strong>カテゴリ</strong>（ドリンク・フード・セット・その他）</li>
  <li><strong>単価</strong>（税抜き価格で入力）</li>
  <li><strong>税区分</strong>（課税/非課税）</li>
  <li><strong>在庫フラグ</strong>（品切れ時はオフにすると伝票に表示されなくなる）</li>
</ul>

<div class="article-img-box">
  <img src="/blog/sc_product_add.webp" alt="商品登録画面：名称・カテゴリ・単価・税区分入力" loading="lazy" />
  <p class="article-img-caption">商品登録画面：名称・カテゴリ・単価・税区分入力</p>
</div>

<hr/>

<h2>カテゴリを整理する</h2>

<p>カテゴリは初期値の他に<strong>カスタムカテゴリ</strong>を作成できます。例えば「シャンパン」「焼酎」「フード」などを独立カテゴリにすると、伝票追加時の絞り込みが圧倒的に速くなります。営業中にお客様を待たせる時間を最小化できます。</p>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  カテゴリは最大20個まで作成できます。注文頻度の高い商品は「お気に入り」登録すると最上部に固定されます。
</div>

<hr/>

<h2>価格を一括変更する</h2>

<p>値上げ・値下げが必要な場合は<strong>商品一覧 → 一括編集モード</strong>をオンにすると、複数商品の価格をまとめて変更できます。変更は即時反映されますが、精算済み伝票には影響しません。季節価格や特別イベント料金への切り替えも素早く対応できます。</p>

<div class="article-img-box">
  <img src="/blog/sc_product_master.webp" alt="一括編集モード：チェックボックス選択 → 価格変更ダイアログ" loading="lazy" />
  <p class="article-img-caption">一括編集モード：チェックボックス選択 → 価格変更ダイアログ</p>
</div>

<hr/>

<h2>品切れ設定で注文ミスを防ぐ</h2>

<p>在庫切れ商品の<strong>在庫フラグをオフ</strong>にすると、伝票の商品追加画面に表示されなくなります。スタッフが誤って在庫なし商品を追加するミスを防げます。入荷後はフラグをオンに戻すだけで再度表示されます。</p>

<hr/>

<h2>セットメニューとの連携</h2>

<p>「シャンパンセット」など複数商品をまとめたセットメニューも登録可能です。セット内訳を個別登録しておくと、伝票にセット名を追加した際に内訳が自動展開されます。これにより会計の透明性が高まり、お客様からの信頼も得られます。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事10 =====
  {
    slug: "customer-management",
    title: "顧客管理機能 — リピーター把握から来店履歴・誕生日アラートまで",
    description: "顧客の登録・来店回数・お気に入りキャスト・会計傾向を一元管理する方法を解説します。",
    category: "機能説明",
    publishedAt: "2026-04-25",
    readingMinutes: 6,
    content: `
<p>水商売では<strong>顧客一人ひとりの好みや来店履歴</strong>を把握することが売上アップの鍵です。Shine Check の顧客管理機能でリピーター対応を強化しましょう。</p>

<hr/>

<h2>顧客を登録する</h2>

<p><strong>顧客管理 → ＋顧客追加</strong>から登録します。入力項目は以下です。</p>
<ul>
  <li>お客様名（源氏名・ニックネーム可）</li>
  <li>連絡先（任意）</li>
  <li>誕生日（誕生日月にアラート表示）</li>
  <li>担当キャスト</li>
  <li>メモ（飲み物の好み・NGなど）</li>
</ul>

<div class="screenshot-box">
  📸 <em>顧客登録画面：基本情報・メモ・担当キャスト選択</em>
</div>

<hr/>

<h2>来店履歴を確認する</h2>

<p>顧客詳細ページには<strong>来店履歴</strong>が時系列で表示されます。各来店の会計金額・利用卓・担当キャストが記録されており、「前回何を頼んだか」がすぐわかります。常連客が来店した瞬間に履歴を開き、好みに合った提案ができます。</p>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  来店履歴から「前回と同じ注文で開票」ができます。常連客の対応がスムーズになります。
</div>

<hr/>

<h2>VIP・ランク設定</h2>

<p>来店回数・累計会計金額をもとに<strong>顧客ランク</strong>を設定できます。ランクに応じてサービス内容を変える運用（例：VIPはドリンク1本サービス）を記録として残すことも可能です。スタッフが交代しても引き継ぎがスムーズです。</p>

<div class="screenshot-box">
  📸 <em>顧客詳細：ランクバッジ・来店回数・累計金額表示</em>
</div>

<hr/>

<h2>誕生日アラート活用</h2>

<p>誕生日を登録しておくと、誕生日月に<strong>ダッシュボードにアラート</strong>が表示されます。「今月誕生日のお客様」一覧からお祝いの準備や来店促進の動きが取りやすくなります。誕生日サプライズで顧客ロイヤルティを高めましょう。</p>

<hr/>

<h2>顧客データのプライバシー管理</h2>

<p>顧客データはスタッフ権限では閲覧のみ可能で、<strong>削除・エクスポートは管理者のみ</strong>実行できます。個人情報を適切に保護しながら必要な情報を活用できます。</p>

<hr/>

<h2>ユースケース：常連客の「いつもの」対応</h2>

<p>常連のAさんが来店した際、スタッフはすぐに顧客ページを開き「前回：シャンパン1本、ウイスキー水割り3杯、担当：◯◯キャスト」を確認。「いつものでよろしいですか？」と声をかけられる接客が実現します。これにより顧客満足度と単価アップが同時に期待できます。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事11 =====
  {
    slug: "settings-guide",
    title: "店舗設定を最適化しよう — 税率・サービス料・セット時間の設定方法",
    description: "消費税率・サービス料率・セット時間・延長料金など、料金計算の根幹となる設定項目を詳解します。",
    category: "機能説明",
    publishedAt: "2026-04-25",
    readingMinutes: 5,
    content: `
<p>Shine Check の料金計算は<strong>設定画面の値</strong>をもとに自動で行われます。開業前・料金改定時に必ず確認してください。設定を正しく行うことで会計ミスや売上漏れを根本から防げます。</p>

<hr/>

<h2>基本料金設定</h2>

<p><strong>設定 → 店舗情報 → 料金設定</strong>から以下を入力します。</p>
<ul>
  <li><strong>消費税率</strong>（例：10%）</li>
  <li><strong>サービス料率</strong>（例：15%）</li>
  <li><strong>税計算方式</strong>：内税（税込み価格で登録）/ 外税（税抜き価格で登録）</li>
  <li><strong>サービス料の課税対象</strong>：サービス料に税をかけるかどうか</li>
</ul>

<div class="article-img-box">
  <img src="/blog/sc_slip_new2.webp" alt="料金設定画面：税率・サービス料・計算方式スイッチ" loading="lazy" />
  <p class="article-img-caption">料金設定画面：税率・サービス料・計算方式スイッチ</p>
</div>

<hr/>

<h2>セット時間・延長設定</h2>

<p>セットの基本時間と延長単位を設定できます。</p>
<ul>
  <li><strong>基本セット時間</strong>（例：90分）</li>
  <li><strong>延長単位時間</strong>（例：30分）</li>
  <li><strong>延長料金</strong>（例：1人あたり3,000円/30分）</li>
  <li><strong>延長自動加算</strong>：タイマー超過時に自動で延長料金を追加するか</li>
</ul>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  「延長自動加算」をオンにすると、スタッフが延長を入力し忘れる会計漏れを防げます。繁忙時でも安心です。
</div>

<hr/>

<h2>複数セットメニューの設定</h2>

<p>「90分コース」「2時間コース」など複数の席種を設定できます。各コースに異なる料金・時間を設定し、開票時にスタッフが選択するだけで正確な計算が始まります。</p>

<div class="screenshot-box">
  📸 <em>セットメニュー一覧：コース名・時間・人数単価の一覧管理</em>
</div>

<hr/>

<h2>設定変更のタイミング</h2>

<p>設定変更は<strong>翌伝票開票から有効</strong>になります。進行中の伝票には変更前の設定が適用されるため、営業時間中の変更は避けてください。必ず<strong>開店前</strong>に確認・変更を行いましょう。</p>

<hr/>

<h2>設定ミスによるトラブル事例と対処法</h2>

<p><strong>事例1：消費税が二重計算されていた</strong><br/>商品価格を「税込みで登録 + 外税設定」にしてしまい、消費税が二重にかかっていたケース。価格登録時の税込み/税抜きと設定の一致を必ず確認しましょう。</p>
<p><strong>事例2：延長料金が未請求だった</strong><br/>「延長自動加算オフ」の状態でスタッフが延長入力を忘れるケース。自動加算をオンにするだけで解決します。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事12 =====
  {
    slug: "stripe-plan-upgrade",
    title: "プランのアップグレードと課金管理 — Stripeを使った安全な決済",
    description: "Standard/Premiumプランの違い、アップグレード手順、サブスクリプション管理をわかりやすく解説します。",
    category: "使い方Tips",
    publishedAt: "2026-04-25",
    readingMinutes: 4,
    content: `
<p>Shine Check は<strong>Stripe</strong>を通じた安全なサブスクリプション決済に対応しています。プランの確認・変更・キャンセルがすべてアプリ上で完結します。面倒な手続きは一切ありません。</p>

<hr/>

<h2>プランの違い</h2>

<p>現在 Shine Check では以下のプランを提供しています。</p>
<ul>
  <li><strong>Standardプラン</strong>：基本機能（伝票・卓・商品・キャスト管理）</li>
  <li><strong>Premiumプラン</strong>：分析・顧客管理・CSV出力・複数店舗・優先サポートが追加</li>
</ul>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  まずはStandardプランで使い始め、売上が安定してきたらPremiumへのアップグレードを検討するのがおすすめです。
</div>

<hr/>

<h2>アップグレードの手順</h2>

<ol>
  <li>右上のメニュー → <strong>「プランのアップグレード」</strong>をタップ</li>
  <li>Premiumプランの内容を確認し「アップグレードする」をタップ</li>
  <li>Stripeの安全な決済画面でクレジットカード情報を入力</li>
  <li>「支払う」ボタンを押せば即時有効化</li>
</ol>

<div class="screenshot-box">
  📸 <em>プラン選択画面：Standard/Premium比較・Stripeチェックアウト</em>
</div>

<hr/>

<h2>請求・領収書の確認</h2>

<p><strong>設定 → 請求履歴</strong>から過去の請求一覧と領収書PDFをダウンロードできます。経費精算や帳簿管理に活用してください。税理士に渡す際もPDFそのままで対応できます。</p>

<hr/>

<h2>サブスクリプションのキャンセル</h2>

<p><strong>設定 → サブスクリプション管理 → キャンセル</strong>からいつでも解約できます。キャンセル後も月末（次回更新日）まで利用可能です。データは90日間保持されるため、再開時も引き継ぎできます。</p>

<hr/>

<h2>支払い失敗時の対処</h2>

<p>カードの有効期限切れなどで支払いが失敗した場合、登録メールにアラートが届きます。<strong>設定 → 支払い方法</strong>からカード情報を更新すると自動で再請求されます。3回連続失敗するとアカウントが一時停止になるためご注意ください。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事13 =====
  {
    slug: "trouble-login",
    title: "困ったときに — ログインできない・パスワードを忘れた場合の対処法",
    description: "ログイン失敗・パスワード再設定・アカウントロックの解除方法をステップごとに解説します。",
    category: "使い方Tips",
    publishedAt: "2026-04-25",
    readingMinutes: 4,
    content: `
<p>「ログインできない！」は最も多いお問い合わせの一つです。このページでは<strong>原因別の対処法</strong>をまとめました。順番に確認するだけで多くのケースが解決します。</p>

<hr/>

<h2>よくある原因チェックリスト</h2>

<ul>
  <li>✅ メールアドレスの入力ミス（大文字・小文字・ドット位置）</li>
  <li>✅ パスワードのコピペ時の余白（スペース）が混入している</li>
  <li>✅ CapsLockがオンになっている</li>
  <li>✅ ブラウザのキャッシュが古い（スマホアプリを強制終了して再起動）</li>
  <li>✅ 別のメールアドレスで登録している（Gmail/Google認証など）</li>
</ul>

<div class="screenshot-box">
  📸 <em>ログイン画面：メール入力・パスワード入力・「パスワードを忘れた」リンク</em>
</div>

<hr/>

<h2>パスワードを再設定する</h2>

<ol>
  <li>ログイン画面下部の<strong>「パスワードを忘れた方はこちら」</strong>をタップ</li>
  <li>登録メールアドレスを入力して「送信」</li>
  <li>届いたメールの<strong>「パスワードを再設定する」</strong>リンクをクリック</li>
  <li>新しいパスワードを2回入力して「変更する」</li>
</ol>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  再設定メールが届かない場合は迷惑メールフォルダを確認してください。それでも届かない場合は登録アドレスが異なる可能性があります。
</div>

<hr/>

<h2>アカウントロックの解除</h2>

<p>パスワードを5回連続間違えるとアカウントが<strong>30分ロック</strong>されます。30分後に再試行するか、パスワード再設定メールを送ってください。ロック中は何度試みてもログインできませんのでご注意ください。</p>

<hr/>

<h2>スタッフアカウントにログインできない</h2>

<p>スタッフ用アカウントは<strong>管理者が招待メールを送付</strong>する形で発行されます。招待メールの有効期限（24時間）が切れている場合は管理者に再送信を依頼してください。</p>

<div class="screenshot-box">
  📸 <em>管理者画面：スタッフ招待 → メール送信 → 招待再送</em>
</div>

<hr/>

<h2>それでも解決しない場合</h2>

<p>アプリ内の<strong>「お問い合わせ」</strong>から、使用デバイス・OS・発生日時を添えてご連絡ください。24時間以内に対応します（Premiumプランは優先対応）。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事14 =====
  {
    slug: "trouble-slip-error",
    title: "困ったときに — 伝票の金額が合わない・会計ミスが発生したときの対処法",
    description: "会計金額の不一致・精算済み伝票の修正・返金対応など、よくある伝票トラブルの解決策を解説します。",
    category: "使い方Tips",
    publishedAt: "2026-04-25",
    readingMinutes: 5,
    content: `
<p>「会計金額が合わない」「精算後にミスが発覚した」など、伝票に関するトラブルへの<strong>正しい対処法</strong>をまとめました。落ち着いて手順通りに対応すれば、ほとんどのケースで解決できます。</p>

<hr/>

<h2>金額が合わない主な原因</h2>

<ul>
  <li>延長料金が加算されていない</li>
  <li>商品の数量を誤って入力した</li>
  <li>人数変更後の再計算が行われていない</li>
  <li>税率・サービス料の設定が変更されていた</li>
</ul>

<div class="article-img-box">
  <img src="/blog/sc_slip_payment.webp" alt="伝票詳細：料金内訳展開表示（セット・延長・商品・サービス料・税）" loading="lazy" />
  <p class="article-img-caption">伝票詳細：料金内訳展開表示（セット・延長・商品・サービス料・税）</p>
</div>

<hr/>

<h2>精算前に気づいた場合</h2>

<p>精算前であれば伝票内の<strong>任意の項目を編集</strong>できます。</p>
<ul>
  <li>商品の数量変更：商品行を左スワイプ → 数量変更</li>
  <li>延長追加：「延長」ボタンから追加</li>
  <li>人数変更：「人数変更」から修正</li>
</ul>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  精算前に必ず「料金内訳」を展開して確認する習慣をスタッフ全員に周知しましょう。
</div>

<hr/>

<h2>精算後に気づいた場合（当日）</h2>

<p>当日精算済み伝票は<strong>伝票履歴 → 対象伝票 → 「再オープン」</strong>から修正できます（管理者・マネージャー権限が必要）。修正後に再精算すると日次売上に正しく反映されます。</p>

<div class="screenshot-box">
  📸 <em>伝票履歴：精算済み一覧 → 再オープンボタン</em>
</div>

<hr/>

<h2>精算後に気づいた場合（翌日以降）</h2>

<p><strong>管理者メニュー → 売上修正</strong>から対象日・対象伝票を選択して修正できます。修正理由の入力が必須で、変更ログが残ります。不正修正防止のため、変更履歴はすべて記録されます。</p>

<hr/>

<h2>返金対応が必要な場合</h2>

<p>過請求が発覚した場合は<strong>返金記録</strong>を伝票に紐づけて記録しましょう。返金方法（現金返金・次回値引き）をメモ欄に記入しておくと帳簿管理がスムーズです。Stripe決済と連携している場合はStripeダッシュボードからも返金処理が可能です。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事15 =====
  {
    slug: "usecase-snack",
    title: "ユースケース：スナック・バーでの活用 — 1人で切り盛りする小規模店舗向け",
    description: "ママが1人でカウンター営業するスナック・バー向けの効率的な使い方を具体例付きで解説します。",
    category: "ユースケース",
    publishedAt: "2026-04-25",
    readingMinutes: 6,
    content: `
<p>スナックやバーでは<strong>ママ1人で接客・会計・在庫管理</strong>をこなすケースが多く、効率化が売上に直結します。Shine Check の活用方法を実例で解説します。</p>

<hr/>

<h2>こんな課題はありませんか？</h2>

<ul>
  <li>手書き伝票でお客様を待たせてしまう</li>
  <li>閉店後の集計に30分以上かかる</li>
  <li>「あの常連さん、先月いくら使ってたっけ？」がわからない</li>
  <li>ボトルキープの管理が煩雑</li>
</ul>

<div class="screenshot-box">
  📸 <em>カウンター席メインのシンプルな卓構成例</em>
</div>

<hr/>

<h2>スナック向けおすすめ設定</h2>

<p><strong>卓設定</strong>：「カウンター1〜6」「テーブルA・B」など座席ごとに分ける。常連客は専用席に固定することも可能です。</p>
<p><strong>商品登録</strong>：ボトルキープを商品登録（「ボトルキープ：山崎12年」など）。残量メモも商品メモ欄に記入できます。</p>
<p><strong>セット設定</strong>：「チャージ1,500円」「ボトルセット5,000円」など最低限のセットメニューに絞ると開票が素早くなります。</p>

<hr/>

<h2>1日の流れ（実例）</h2>

<ol>
  <li><strong>19:00 開店前</strong>：ダッシュボードで先週の売上確認・誕生日アラートチェック</li>
  <li><strong>20:00 開店・来客</strong>：カウンター1の卓をタップ → 伝票開票（チャージ選択 → 1名）</li>
  <li><strong>21:30 追加注文</strong>：「ハイボール×2」を伝票に追加（3秒で完了）</li>
  <li><strong>23:00 会計</strong>：「精算する」→ 金額確認 → 現金受領 → 完了</li>
  <li><strong>01:00 閉店後</strong>：「営業終了」ボタンを押すだけ。日次集計は自動完了</li>
</ol>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  閉店後の集計が30分→3分に短縮されたとの声が多数あります。翌日の準備時間が大幅に増えます。
</div>

<hr/>

<h2>ボトルキープ管理</h2>

<p>常連客のボトルキープは<strong>顧客メモ欄</strong>に「山崎12年 残1/3（2026/04/15開封）」と記録するのが便利です。開封日と残量を記録しておくことで、次来店時に「そろそろ新しいボトル入れましょうか」とプッシュできます。顧客単価アップにも直結します。</p>

<hr/>

<h2>月次売上の把握</h2>

<p>分析 → 月次サマリーで<strong>今月の売上・客単価・来客数</strong>を一覧確認できます。「先月より客単価が下がった」「来客数は増えているが売上が横ばい」などの課題がすぐ見えます。対策を打つスピードが上がり、経営改善サイクルが早まります。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事16 =====
  {
    slug: "usecase-hostclub",
    title: "ユースケース：ホストクラブでの活用 — 指名・シャンパンコール・バック管理",
    description: "ホストクラブ特有の指名管理・シャンパンコール・バック計算をShine Checkで効率化する方法を解説します。",
    category: "ユースケース",
    publishedAt: "2026-04-25",
    readingMinutes: 7,
    content: `
<p>ホストクラブでは<strong>指名・シャンパンコール・ホストバック</strong>の管理が複雑です。Shine Check を使ったスマートな運用方法を紹介します。</p>

<hr/>

<h2>指名管理の設定</h2>

<p>キャスト（ホスト）管理から各ホストのプロフィールを登録します。</p>
<ul>
  <li>源氏名・写真</li>
  <li>指名料金（席についた際の指名チャージ）</li>
  <li>バック率（売上に対するホストへのバック割合）</li>
</ul>

<div class="screenshot-box">
  📸 <em>キャスト管理：ホスト一覧・指名料金・バック率設定</em>
</div>

<hr/>

<h2>伝票でのシャンパンコール対応</h2>

<p>シャンパンコールが入ったら伝票の「商品追加」から登録済みシャンパンを選択します。シャンパンに対するバックが自動計算されるよう、<strong>商品ごとのバック率</strong>を事前設定しておくのがポイントです。</p>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  高額シャンパンは個別商品として登録し、バック率を高めに設定しておくとホストのモチベーション管理に活用できます。
</div>

<hr/>

<h2>バック計算の流れ</h2>

<ol>
  <li>精算完了時に売上データが自動集計される</li>
  <li>分析 → キャスト別売上でホストごとの売上を確認</li>
  <li>バック率 × 売上でバック金額を算出（設定済みの場合は自動表示）</li>
  <li>CSV出力して給与計算に連携可能（Premiumプラン）</li>
</ol>

<div class="article-img-box">
  <img src="/blog/sc_slip_total.webp" alt="キャスト別売上：担当売上・指名本数・バック金額一覧" loading="lazy" />
  <p class="article-img-caption">キャスト別売上：担当売上・指名本数・バック金額一覧</p>
</div>

<hr/>

<h2>担当交代・同伴の記録</h2>

<p>途中からホストが同伴についた場合、伝票の<strong>「担当追加」</strong>から時間帯付きで記録できます。同伴前後の時間が分けて記録されるため、バック計算の正確性が保たれます。</p>

<hr/>

<h2>月間ランキングの活用</h2>

<p>分析機能の<strong>キャスト別月次ランキング</strong>で「今月のトップホスト」「指名本数ランキング」が表示できます。ホスト同士の健全な競争意識を生み、店舗全体の売上向上につながります。</p>

<hr/>

<h2>よくある質問</h2>
<p><strong>Q. 無指名のテーブルに複数ホストがついた場合は？</strong><br/>
A. 担当に複数ホストを追加し、バック率を均等配分に設定することができます。どのホストがどの時間帯にいたかのログも残ります。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事17 =====
  {
    slug: "csv-export",
    title: "CSV出力機能 — 売上データを会計ソフト・Excelに連携する方法（Premiumプラン）",
    description: "日次・月次売上のCSVエクスポート、会計ソフト連携、Excelでの集計方法をわかりやすく解説します。",
    category: "機能説明",
    publishedAt: "2026-04-25",
    readingMinutes: 5,
    content: `
<p>PremiumプランではすべてのデータをCSVでエクスポートし、<strong>会計ソフト・Excelへの連携</strong>が可能です。税理士への報告も簡単になり、経営管理の質が一段階上がります。</p>

<hr/>

<h2>CSV出力できるデータ</h2>

<ul>
  <li>日次売上サマリー（日付・売上・客数・客単価）</li>
  <li>伝票一覧（伝票番号・日時・金額・支払い方法）</li>
  <li>キャスト別売上（キャスト名・担当売上・バック金額）</li>
  <li>商品別売上（商品名・販売数・売上）</li>
  <li>顧客来店履歴（顧客名・来店日・会計金額）</li>
</ul>

<div class="screenshot-box">
  📸 <em>分析 → CSV出力：期間選択・データ種別選択・ダウンロードボタン</em>
</div>

<hr/>

<h2>出力手順</h2>

<ol>
  <li><strong>分析</strong>タブを開く</li>
  <li>右上の<strong>「CSV出力」</strong>ボタンをタップ</li>
  <li>期間（開始日〜終了日）を選択</li>
  <li>出力するデータ種別を選択</li>
  <li>「ダウンロード」をタップ → CSVファイルがデバイスに保存</li>
</ol>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  毎月月初に「先月分の伝票一覧CSV」を出力して税理士に送る運用にすると、月次決算が格段にスムーズになります。
</div>

<hr/>

<h2>Excelでの集計方法</h2>

<p>出力したCSVをExcelで開くと、列ごとにデータが整理されています。Excelのピボットテーブル機能を使えば<strong>曜日別・キャスト別・商品別</strong>など多角的な集計が自由自在です。グラフ化して月次報告資料にも活用できます。</p>

<div class="screenshot-box">
  📸 <em>Excel展開例：日次売上CSVをグラフ化したサンプル</em>
</div>

<hr/>

<h2>会計ソフトへの取り込み</h2>

<p>freee・マネーフォワードなどの会計ソフトはCSVインポートに対応しています。Shine CheckのCSV出力形式を確認し、会計ソフト側のインポートフォーマットに合わせて列を調整するだけで連携できます。</p>

<hr/>

<h2>データの保存期間</h2>

<p>エクスポートデータはPremiumプランで<strong>過去2年分</strong>まで遡れます。Standardプランは3ヶ月分です。長期データが必要な場合は毎月の定期出力を習慣にしましょう。確定申告の時期に「昨年のデータが見たい」と焦らなくて済みます。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事18 =====
  {
    slug: "staff-permission",
    title: "スタッフ権限管理 — 管理者・マネージャー・スタッフの役割分担",
    description: "3段階の権限設定でセキュリティを保ちながらスタッフ全員がShine Checkを使える環境を作る方法を解説します。",
    category: "機能説明",
    publishedAt: "2026-04-25",
    readingMinutes: 5,
    content: `
<p>Shine Check は<strong>管理者・マネージャー・スタッフ</strong>の3段階権限に対応しています。スタッフには最小限の権限だけを与えることで、データの安全と操作ミスを防止できます。</p>

<hr/>

<h2>権限の違い一覧</h2>

<table class="permission-table">
  <thead>
    <tr><th>機能</th><th>管理者</th><th>マネージャー</th><th>スタッフ</th></tr>
  </thead>
  <tbody>
    <tr><td>伝票開票・精算</td><td>✅</td><td>✅</td><td>✅</td></tr>
    <tr><td>精算済み伝票の再オープン</td><td>✅</td><td>✅</td><td>❌</td></tr>
    <tr><td>売上修正</td><td>✅</td><td>❌</td><td>❌</td></tr>
    <tr><td>キャスト管理</td><td>✅</td><td>✅</td><td>❌</td></tr>
    <tr><td>商品管理</td><td>✅</td><td>✅</td><td>❌</td></tr>
    <tr><td>分析・売上閲覧</td><td>✅</td><td>✅</td><td>❌</td></tr>
    <tr><td>CSV出力</td><td>✅</td><td>✅</td><td>❌</td></tr>
    <tr><td>設定変更</td><td>✅</td><td>❌</td><td>❌</td></tr>
    <tr><td>スタッフ招待・削除</td><td>✅</td><td>❌</td><td>❌</td></tr>
  </tbody>
</table>

<div class="screenshot-box">
  📸 <em>スタッフ管理画面：権限別一覧・招待ボタン</em>
</div>

<hr/>

<h2>スタッフを招待する</h2>

<ol>
  <li><strong>設定 → スタッフ管理 → ＋招待</strong>をタップ</li>
  <li>スタッフのメールアドレスと付与する権限を選択</li>
  <li>「招待メールを送る」をタップ</li>
  <li>スタッフがメールのリンクをクリックして登録完了（24時間有効）</li>
</ol>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  信頼できる副店長にはマネージャー権限を付与し、売上確認や再精算をお任せすると管理者の負担が大幅に減ります。
</div>

<hr/>

<h2>退職スタッフのアクセスを即時停止する</h2>

<p>スタッフが退職した際は<strong>スタッフ管理 → 対象者 → 「アクセス無効化」</strong>をすぐ実行してください。無効化すると即座にログイン不可になります。データは管理者側に残ります。退職後のデータ漏洩リスクを最小化できます。</p>

<hr/>

<h2>PIN認証で共有デバイスのセキュリティを強化</h2>

<p>店舗内の共有タブレットでは<strong>PIN認証モード</strong>を活用できます。ログインしたままで4桁PINでスタッフ切り替えができるため、デバイス共有時もデータが守られます。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事19 =====
  {
    slug: "usecase-multi-store",
    title: "ユースケース：複数店舗運営 — グループ店舗の一元管理",
    description: "2店舗以上を経営するオーナー向けに、Shine Checkで複数店舗の売上・スタッフを一括管理する方法を解説します。",
    category: "ユースケース",
    publishedAt: "2026-04-25",
    readingMinutes: 6,
    content: `
<p>2店舗・3店舗と経営を拡大するにつれ、<strong>各店舗のデータをバラバラに管理するコスト</strong>が増大します。Shine Check は1つのアカウントで複数店舗を一元管理できます。</p>

<hr/>

<h2>複数店舗の構成例</h2>

<ul>
  <li>グループの本店キャバクラ（大阪）</li>
  <li>姉妹店スナック（大阪 北新地）</li>
  <li>新規出店ガールズバー（東京 六本木）</li>
</ul>

<p>これら3店舗すべてを<strong>同一アカウント・異なる店舗ID</strong>で管理できます。移動中のスマートフォンから全店舗の売上をリアルタイム確認できる点がオーナーから好評です。</p>

<div class="screenshot-box">
  📸 <em>店舗切り替え：ヘッダーの店舗名ドロップダウン → 即時切り替え</em>
</div>

<hr/>

<h2>店舗を追加する</h2>

<ol>
  <li><strong>設定 → 店舗管理 → ＋店舗追加</strong></li>
  <li>店舗名・住所・基本料金設定を入力</li>
  <li>各店舗のスタッフを招待（店舗ごとに独立した権限管理）</li>
</ol>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  店舗ごとに消費税・サービス料・セット料金を個別設定できます。価格帯の異なる店舗でも正確な計算が可能です。
</div>

<hr/>

<h2>グループ全体の売上を一覧確認</h2>

<p><strong>分析 → グループサマリー</strong>では全店舗の売上を一画面で比較できます。</p>
<ul>
  <li>店舗別今月売上ランキング</li>
  <li>グループ合計売上・客数・客単価</li>
  <li>店舗間の売上トレンド比較グラフ</li>
</ul>

<div class="screenshot-box">
  📸 <em>グループサマリー：複数店舗の月次売上比較グラフ</em>
</div>

<hr/>

<h2>スタッフの店舗異動</h2>

<p>スタッフが複数店舗をかけ持ちする場合、<strong>複数店舗へのアクセス権限</strong>を付与できます。それぞれの店舗での出勤記録・担当売上も独立して管理されます。</p>

<hr/>

<h2>オーナーの1日ルーティン</h2>

<ol>
  <li><strong>朝10:00</strong>：グループサマリーで昨日の全店舗売上確認（2分）</li>
  <li><strong>各店舗のマネージャー</strong>：自店の売上確認・シフト管理</li>
  <li><strong>月初</strong>：全店舗のCSVを一括エクスポートして税理士へ送付</li>
</ol>

<hr/>

<h2>店舗数が増えても追加費用なし（Premiumプラン）</h2>

<p>Premiumプランでは店舗数の上限がないため、グループ全店舗を1プランで管理できます。店舗ごとに別々のサブスクリプションを契約するより大幅にコストを抑えられます。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },

  // ===== 記事20 =====
  {
    slug: "getting-started-checklist",
    title: "開店前チェックリスト — Shine Check を本番稼働させるための15ステップ",
    description: "初日の本番稼働前に確認すべき設定・テスト手順をチェックリスト形式でまとめました。",
    category: "はじめに",
    publishedAt: "2026-04-25",
    readingMinutes: 7,
    content: `
<p>Shine Check を使い始めたら、<strong>開店当日に慌てないよう</strong>事前に全設定を確認しましょう。このチェックリストを上から順にクリアすれば完璧です。</p>

<hr/>

<h2>アカウント・基本設定</h2>

<ul>
  <li>✅ 店舗名・住所を正しく入力した</li>
  <li>✅ 消費税率・サービス料率を設定した</li>
  <li>✅ 税計算方式（内税/外税）を確認した</li>
  <li>✅ セット時間・延長時間・延長料金を設定した</li>
  <li>✅ 延長自動加算のオン/オフを決めた</li>
</ul>

<div class="article-img-box">
  <img src="/blog/sc_dashboard_main.webp" alt="設定画面チェック：税率・サービス料・セット時間が正しく入力されている状態" loading="lazy" />
  <p class="article-img-caption">設定画面チェック：税率・サービス料・セット時間が正しく入力されている状態</p>
</div>

<hr/>

<h2>卓・商品・キャスト登録</h2>

<ul>
  <li>✅ 全卓を登録した（卓名・定員・並び順）</li>
  <li>✅ 主要ドリンク・商品を登録した（単価・税区分）</li>
  <li>✅ カテゴリを整理した</li>
  <li>✅ キャスト全員を登録した（バック率も設定）</li>
  <li>✅ よく頼まれる商品をお気に入り登録した</li>
</ul>

<div class="tip-box">
  <strong>💡 Tip</strong><br/>
  商品は全部登録しなくても大丈夫です。よく注文される上位20品から登録し、営業しながら追加するスタイルが現実的です。
</div>

<hr/>

<h2>スタッフ招待・権限設定</h2>

<ul>
  <li>✅ スタッフ全員に招待メールを送った</li>
  <li>✅ 各スタッフが招待を受け入れてログインできることを確認した</li>
  <li>✅ マネージャー権限を付与すべきスタッフに設定した</li>
</ul>

<div class="screenshot-box">
  📸 <em>スタッフ一覧：全員がアクティブ（緑）になっている確認画面</em>
</div>

<hr/>

<h2>テスト運用（開店前日に実施）</h2>

<ul>
  <li>✅ テスト伝票を開票し、商品追加 → 精算まで一連の操作を確認した</li>
  <li>✅ タイマーが正常に動作することを確認した</li>
  <li>✅ 精算後に売上データが反映されることを確認した</li>
  <li>✅ スタッフ全員が伝票操作を練習した</li>
  <li>✅ テストデータを「売上修正」で削除（または翌日分から開始）した</li>
</ul>

<hr/>

<h2>営業終了フローの確認</h2>

<ul>
  <li>✅ 「営業終了」ボタンの場所をスタッフ全員に共有した</li>
  <li>✅ 日次集計の確認方法を覚えた</li>
</ul>

<hr/>

<h2>全ステップ完了後</h2>

<p>15項目すべてにチェックが入ったら、Shine Check は本番稼働の準備完了です。初日の営業から<strong>スムーズな会計・正確な売上管理</strong>をお楽しみください。</p>

<p>わからないことがあれば、このメディアの各記事や、アプリ内「お問い合わせ」からいつでもご連絡ください。Shine Check があなたの店舗運営を全力でサポートします。</p>

<div class="banner-box">
  <a href="https://www.yoru-navi-shine.com/" target="_blank" rel="noopener noreferrer">
    <div class="banner-inner">
      <div class="banner-text">
        <span class="banner-label">夜職ナビ Shine</span>
        <span class="banner-desc">夜職のお仕事探しはこちら ✨</span>
      </div>
      <span class="banner-btn">詳しく見る →</span>
    </div>
  </a>
</div>
    `,
  },
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: ArticleCategory): Article[] {
  return articles.filter((a) => a.category === category);
}

export const ALL_CATEGORIES: ArticleCategory[] = [
  "はじめに",
  "機能説明",
  "使い方Tips",
  "ユースケース",
];
