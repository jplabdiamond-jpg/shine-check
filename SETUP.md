# 水商売向け伝票SaaS - セットアップガイド

## 技術スタック

| レイヤー | 技術 | 選定理由 |
|---------|------|---------|
| Frontend | Next.js 14 (App Router) | SSR+CSR混在, 高速 |
| Styling | Tailwind CSS | モバイルファースト, 高速開発 |
| Backend/DB | Supabase (PostgreSQL) | Realtime, Auth, RLS内蔵 |
| State | Zustand | 軽量, シンプル |
| 通知 | react-hot-toast | 現場UI向け |
| グラフ | Recharts | 分析画面 |

## ディレクトリ構成

```
水商売用の伝票SaaS/
├── app/
│   ├── (auth)/          # 認証ページ（ログイン・登録）
│   │   ├── login/
│   │   └── register/
│   └── (app)/           # 認証済みページ
│       ├── dashboard/   # ダッシュボード
│       ├── tables/      # 卓管理
│       ├── slips/       # 伝票一覧・詳細・新規
│       ├── products/    # 商品マスタ
│       ├── casts/       # キャスト管理（Premium）
│       ├── analytics/   # 売上分析（Premium）
│       ├── settings/    # 設定
│       └── upgrade/     # プランアップグレード
├── components/
│   ├── layout/          # AppShell（ナビ）
│   └── slip/            # ProductSelector等
├── lib/
│   ├── supabase/        # client/server/middleware
│   └── utils.ts         # 日付・金額フォーマット
├── store/               # Zustand state
├── types/               # TypeScript型定義
└── .env.local           # 環境変数
```

## 初期セットアップ

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数確認（.env.local は設定済み）
cat .env.local

# 3. 開発サーバー起動
npm run dev
```

## DB情報

- Supabase Project ID: `jjfddcngrewyxfycffrg`
- Region: ap-northeast-1（東京）
- URL: https://jjfddcngrewyxfycffrg.supabase.co

## 機能一覧

### スタンダードプラン（¥2,000/月）
- ✅ 伝票作成（1日15枚）
- ✅ 商品マスタ管理
- ✅ 卓管理
- ✅ 税・サービス料設定
- ✅ リアルタイム同期

### プレミアムプラン（¥5,000/月）
- ✅ 伝票無制限
- ✅ キャスト管理・給与計算
- ✅ 顧客CRM
- ✅ 詳細分析・AI分析
- ✅ 不正防止・ロック機能

## MVP開発ステップ

1. [完了] DBスキーマ設計・Supabase適用
2. [完了] 認証・店舗登録
3. [完了] 卓管理UI
4. [完了] 伝票作成・商品追加・会計
5. [完了] ダッシュボード・営業終了
6. [完了] キャスト・分析（Premium）
7. [次フェーズ] Stripe決済連携
8. [次フェーズ] PWA・オフライン対応
9. [次フェーズ] CSV出力・給与計算
