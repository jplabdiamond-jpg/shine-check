# 水商売向け伝票SaaS — プロジェクト引き継ぎノート

## スタック
- **フレームワーク**: Next.js 14 App Router (`app/` ディレクトリ)
- **DB**: Neon PostgreSQL (`@neondatabase/serverless`) — 接続は `lib/db/index.ts`
- **認証**: NextAuth.js v4 (Credentials provider) — `lib/auth/nextauth.ts`
- **状態管理**: Zustand (`store/authStore.ts`)
- **スタイル**: Tailwind CSS
- **通知**: react-hot-toast

---

## DB接続情報（重要）

- **Neon DB URL**: `DATABASE_URL` in `.env.local`
- **接続先**: `ep-restless-tooth-a468ubrd.us-east-1.aws.neon.tech/neondb`
- **Supabase MCP** (`jjfddcngrewyxfycffrg`) は**別プロジェクト**（デザインスタイルDBなど）。アプリのDBはNeonであり混同しないこと
- Neon DBへの直接SQL実行はプロジェクトルートで `node --input-type=module` を使う

```bash
cd /sessions/focused-trusting-davinci/mnt/水商売用の伝票SaaS
node --input-type=module << 'EOF'
import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_Njkl2QLyh9CW@ep-restless-tooth-a468ubrd.us-east-1.aws.neon.tech/neondb?sslmode=require');
const result = await sql`SELECT ...`;
console.log(result);
EOF
```

---

## 絶対に守るべきルール（過去のバグ原因）

### 1. Neon NUMERICは文字列で返る
- `NUMERIC` / `DECIMAL` 型カラムはJSで**文字列**として返る
- `reduce`で足し算すると文字列結合になり巨大な数になる
- **必ず `Number()` で変換**すること

```ts
// NG
const total = slips.reduce((sum, s) => sum + s.total_amount, 0);
// OK
const total = slips.reduce((sum, s) => sum + Number(s.total_amount ?? 0), 0);
```

`formatCurrency(amount)` は `number | string | null | undefined` を受け付け内部で `Number()` 変換済み。

### 2. NeonテンプレートリテラルでのJSONBキャスト
- `${value}::jsonb` はNeonのタグドテンプレート内では**機能しない場合がある**
- JSONBカラムへの挿入は変数に文字列化してからキャスト:

```ts
// NG（動かない場合あり）
await sql`INSERT INTO t (col) VALUES (${obj}::jsonb)`;
// OK
const str = JSON.stringify(obj);
await sql`INSERT INTO t (col) VALUES (${str}::jsonb)`;
```

- `settings/route.ts` では `${JSON.stringify(settingsObj)}::jsonb` で動作確認済み

### 3. 日付はJST AM3:00基準の営業日
- 0:00〜2:59は前日の営業日扱い（夜間営業対応）
- フロント: `lib/utils.ts` の `getTodayBusinessDate()` を使う
- サーバー: 各APIの `getTodayJst()` ヘルパーを使う（同じロジック）

```ts
function getTodayJst(): string {
  const jst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  if (jst.getUTCHours() < 3) jst.setUTCDate(jst.getUTCDate() - 1);
  return jst.toISOString().split("T")[0];
}
```

### 4. `slips.payment_method` のCHECK制約
- 許可値: `'cash'`, `'card'`, `'other'` のみ
- `'day_close'` などは**エラーになる** → `'other'` を使う

### 5. `daily_sales.closed_by` カラム
- Neon本番DBには **`closed_by` カラムが存在しない**
- INSERT時に `closed_by` を含めないこと（Supabase MCP上のスキーマ定義とNeon実物が異なる）

### 6. `stores.plan_expires_at` カラム
- Neon本番DBには **`plan_expires_at` カラムが存在しない**
- UPDATE時に含めないこと

### 7. `toast.info` は存在しない
- `react-hot-toast` に `toast.info` は**ない**
- 代わりに `toast("メッセージ")` を使う

### 8. z-index階層
```
BottomNav: z-50
Modal / ProductSelector / タイマー設定: z-[60]
PaymentFooter: z-40
```

---

## 主要テーブル構造（Neon実物確認済み）

### `stores`
- `id`, `name`, `plan` (`standard`|`premium`), `tax_rate`, `service_rate`, `tax_type`, `service_type`, `daily_slip_limit`, `settings` (JSONB), `created_at`, `updated_at`
- ❌ `plan_expires_at` は**存在しない**

### `store_users`
- `id`, `store_id`, `auth_user_id`, `email`, `name`, `password_hash`, `role`, `pin_code`, `is_active`, `last_login_at`, `created_at`, `updated_at`

### `slips`
- `status`: `open` | `closed` | `voided` | `locked`
- `payment_method`: `cash` | `card` | `other` | NULL
- `subtotal` = slip_itemsのSUM（セット料金込み）— set_priceを別途足さない
- `business_date` = JST AM3:00基準の営業日

### `slip_items`
- `item_type`: `product` | `set` | `extension` | `shimei` | `douhan`
- セット料金は `item_type='set'` として挿入し、リストに表示

### `daily_sales`
- `closed_by` カラム**存在しない** → INSERT時に含めない
- UNIQUE制約: `(store_id, business_date)`

### `tables`
- `is_active`: false でアーカイブ（ソフト削除）
- `status`: `empty` | `occupied` | `reserved`

---

## アーキテクチャ概要

```
app/
├── (app)/              # ログイン済みレイアウト（BottomNav付き）
│   ├── dashboard/      # ダッシュボード・営業終了
│   ├── tables/         # 卓管理・タイマー
│   ├── slips/
│   │   ├── page.tsx    # 伝票一覧（日付別・保存期間フィルタ）
│   │   ├── new/        # 新規伝票作成
│   │   └── [id]/       # 伝票詳細・会計
│   ├── products/       # 商品管理
│   └── settings/       # 設定・ログアウト
├── api/
│   ├── dashboard/      # GET: 当日集計, POST: 営業終了
│   ├── slips/          # GET/POST, [id]: GET/PATCH/DELETE
│   ├── tables/         # GET/POST/DELETE(アーカイブ)
│   ├── settings/       # PATCH: 店舗設定・JSONB settings更新
│   ├── products/       # GET/POST
│   └── register/       # 店舗・ユーザー登録
lib/
├── db/index.ts         # Neon sql接続
├── auth/nextauth.ts    # NextAuth設定
└── utils.ts            # formatCurrency, getTodayBusinessDate等
store/
└── authStore.ts        # Zustand: storeUser, store, isAdmin(), isPremium()
types/
└── database.ts         # 全テーブルの型定義
```

---

## セッション管理
- NextAuth JWT戦略（30日間）
- `session.user.id` = `store_users.id`
- `session.user.storeId` = `stores.id`

---

## 機能一覧と実装状態

| 機能 | 状態 | 備考 |
|------|------|------|
| 認証（ログイン/ログアウト） | ✅ | `signOut({ callbackUrl: "/login" })` |
| 卓管理・タイマー | ✅ | 1秒tick、BlinkTimer、デフォルト有効 |
| 伝票作成（セット/延長料金） | ✅ | 設定画面のデフォルト値を自動反映 |
| 伝票詳細（商品追加/会計/メモ） | ✅ | |
| セット追加・延長追加（タイマーリセット） | ✅ | `reset_timer` action |
| 卓のアーカイブ（✕ボタン） | ✅ | `is_active=false` |
| 営業終了（open伝票を自動会計） | ✅ | payment_method='other' |
| ダッシュボードリセット | ✅ | 営業終了後に0表示 |
| 伝票一覧（日付別・保存期間） | ✅ | 無料3日/有料30日 |
| 設定画面（セット/延長デフォルト） | ✅ | stores.settings JSONBに保存 |
| プラン管理 | ✅ | standard/premium |
| 伝票枚数カウント AM3:00リセット | ✅ | business_date基準 |

---

## 既知の制限・注意事項

- **Supabase MCPの `execute_sql`** はSupabaseプロジェクト(`jjfddcngrewyxfycffrg`)に対して実行され、アプリのNeon DBとは**別物**。スキーマ確認等は両者が異なる場合があるので注意
- **Neon DBの実テーブル**はSupabaseのスキーマ定義より列が少ない場合がある（`closed_by`、`plan_expires_at`等）
- TypeScript strict modeが有効 → `any`型使用時は `// eslint-disable-next-line @typescript-eslint/no-explicit-any` コメント必須

---

## テストアカウント

| メール | パスワード | プラン |
|--------|-----------|--------|
| test@test.com | （本人確認）| premium |

- storeId: `507a41c2-ed32-4873-b9a1-fb38e584f457`
- userId: `5da3bce3-b213-444c-9c6d-736304149541`

---

## よくあるデバッグ手順

### APIが500エラーの場合
1. `detail` フィールドをレスポンスに含めているか確認
2. ターミナルの `[XXXX] ERROR:` ログを確認
3. エラーメッセージを見て原因特定:
   - `column "xxx" does not exist` → Neon実DBにカラムがない → INSERT/UPDATEから除外
   - `violates check constraint` → 許可値以外を挿入しようとしている
   - `violates foreign key constraint` → 参照先レコードが存在しない

### TypeScriptエラーチェック
```bash
cd /sessions/focused-trusting-davinci/mnt/水商売用の伝票SaaS
npx tsc --noEmit 2>&1 | grep "error TS"
```

### Neon DBに直接SQLを実行
```bash
cd /sessions/focused-trusting-davinci/mnt/水商売用の伝票SaaS
node --input-type=module << 'EOF'
import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_Njkl2QLyh9CW@ep-restless-tooth-a468ubrd.us-east-1.aws.neon.tech/neondb?sslmode=require');
const r = await sql`SELECT ...`;
console.log(JSON.stringify(r, null, 2));
EOF
```
