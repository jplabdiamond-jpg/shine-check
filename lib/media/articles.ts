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

<h2>2. 店舗設定</h2>
<p>ログイン後、<strong>設定 → 店舗情報</strong> から以下を設定してください。</p>
<ul>
  <li>消費税率（例：10%）</li>
  <li>サービス料率（例：15%）</li>
  <li>税・サービス料の計算方式（内税/外税）</li>
  <li>セット時間・延長時間のデフォルト値</li>
</ul>

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

<h2>延長の追加</h2>
<p>タイマー満了前後に「延長を追加」ボタンから延長料金を計上できます。延長は何回でも追加可能で、回数も記録されます。</p>

<h2>手動でのセット時間変更</h2>
<p>伝票詳細画面のタイマーアイコンをタップすると、セット時間・延長時間を手動で変更できます。イレギュラーな対応にも柔軟に対応できます。</p>

<div class="tip-box">
  <strong>💡 Tip</strong><br>
  延長料金のデフォルト値は設定から変更できます。キャバクラ・ラウンジなど業態に合わせて調整しましょう。
</div>

<h2>精算時の確認</h2>
<p>伝票クローズ時に「セット×回数」「延長×回数」「ドリンクバック対象商品」が一覧で表示されます。金額の二重確認が簡単にできます。</p>
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
