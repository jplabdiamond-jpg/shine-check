-- ==========================================
-- 水商売伝票SaaS - Neon PostgreSQL スキーマ
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 店舗
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'standard' CHECK (plan IN ('standard','premium')),
  tax_rate NUMERIC(5,2) DEFAULT 10.0,
  service_rate NUMERIC(5,2) DEFAULT 10.0,
  tax_type TEXT DEFAULT 'percent' CHECK (tax_type IN ('percent','fixed')),
  service_type TEXT DEFAULT 'percent' CHECK (service_type IN ('percent','fixed')),
  daily_slip_limit INT DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザー（スタッフ）
CREATE TABLE IF NOT EXISTS store_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin','manager','staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 商品カテゴリ
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  color TEXT DEFAULT '#635BFF',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 商品マスタ
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price NUMERIC(10,0) NOT NULL DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 卓
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  table_type TEXT DEFAULT 'normal' CHECK (table_type IN ('normal','vip','counter')),
  capacity INT DEFAULT 4,
  status TEXT DEFAULT 'empty' CHECK (status IN ('empty','occupied','reserved')),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- キャスト
CREATE TABLE IF NOT EXISTS casts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage_name TEXT,
  drink_back_rate NUMERIC(5,2) DEFAULT 20.0,
  shimei_back_rate NUMERIC(5,2) DEFAULT 30.0,
  douhan_back_rate NUMERIC(5,2) DEFAULT 50.0,
  hourly_wage NUMERIC(10,0) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 顧客
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  visit_count INT DEFAULT 0,
  total_spend NUMERIC(12,0) DEFAULT 0,
  memo TEXT,
  is_vip BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 伝票
CREATE TABLE IF NOT EXISTS slips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  slip_number TEXT NOT NULL,
  name TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','closed','voided','locked')),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  set_minutes INT DEFAULT 60,
  set_price NUMERIC(10,0) DEFAULT 0,
  extension_minutes INT DEFAULT 30,
  extension_price NUMERIC(10,0) DEFAULT 0,
  extension_count INT DEFAULT 0,
  timer_started_at TIMESTAMPTZ,
  subtotal NUMERIC(12,0) DEFAULT 0,
  tax_amount NUMERIC(12,0) DEFAULT 0,
  service_amount NUMERIC(12,0) DEFAULT 0,
  total_amount NUMERIC(12,0) DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash','card','other')),
  is_locked BOOLEAN DEFAULT false,
  lock_reason TEXT,
  created_by UUID REFERENCES store_users(id),
  closed_by UUID REFERENCES store_users(id),
  business_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 伝票明細
CREATE TABLE IF NOT EXISTS slip_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slip_id UUID NOT NULL REFERENCES slips(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price NUMERIC(10,0) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  subtotal NUMERIC(12,0) NOT NULL,
  cast_id UUID REFERENCES casts(id) ON DELETE SET NULL,
  item_type TEXT DEFAULT 'product' CHECK (item_type IN ('product','set','extension','shimei','douhan')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 操作ログ
CREATE TABLE IF NOT EXISTS operation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES store_users(id),
  slip_id UUID REFERENCES slips(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日次売上集計
CREATE TABLE IF NOT EXISTS daily_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  business_date DATE NOT NULL,
  total_slips INT DEFAULT 0,
  total_revenue NUMERIC(12,0) DEFAULT 0,
  total_customers INT DEFAULT 0,
  product_summary JSONB DEFAULT '{}',
  is_closed BOOLEAN DEFAULT false,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, business_date)
);

-- 最近使用商品
CREATE TABLE IF NOT EXISTS recent_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  used_count INT DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_store_users_email ON store_users(email);
CREATE INDEX IF NOT EXISTS idx_store_users_store_id ON store_users(store_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_tables_store_id ON tables(store_id);
CREATE INDEX IF NOT EXISTS idx_slips_store_id ON slips(store_id);
CREATE INDEX IF NOT EXISTS idx_slips_status ON slips(status);
CREATE INDEX IF NOT EXISTS idx_slips_business_date ON slips(business_date);
CREATE INDEX IF NOT EXISTS idx_slip_items_slip_id ON slip_items(slip_id);
CREATE INDEX IF NOT EXISTS idx_daily_sales_store_date ON daily_sales(store_id, business_date);

-- updated_at トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_store_users_updated_at BEFORE UPDATE ON store_users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_slips_updated_at BEFORE UPDATE ON slips FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_slip_items_updated_at BEFORE UPDATE ON slip_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE OR REPLACE TRIGGER trg_daily_sales_updated_at BEFORE UPDATE ON daily_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at();
