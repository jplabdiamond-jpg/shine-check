export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string;
          name: string;
          plan: "standard" | "premium";
          plan_expires_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          tax_rate: number;
          service_rate: number;
          tax_type: "percent" | "fixed";
          service_type: "percent" | "fixed";
          daily_slip_limit: number;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["stores"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["stores"]["Row"]>;
      };
      store_users: {
        Row: {
          id: string;
          store_id: string;
          auth_user_id: string | null;
          email: string;
          name: string;
          password_hash: string;
          role: "admin" | "manager" | "staff";
          pin_code: string | null;
          is_active: boolean;
          last_login_at: string | null;
          cast_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["store_users"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["store_users"]["Row"]>;
      };
      products: {
        Row: {
          id: string;
          store_id: string;
          category_id: string | null;
          name: string;
          price: number;
          is_favorite: boolean;
          is_active: boolean;
          sort_order: number;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["products"]["Row"]>;
      };
      product_categories: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          sort_order: number;
          color: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["product_categories"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["product_categories"]["Row"]>;
      };
      tables: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          table_type: "normal" | "vip" | "counter";
          capacity: number;
          status: "empty" | "occupied" | "reserved";
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tables"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["tables"]["Row"]>;
      };
      casts: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          stage_name: string | null;
          drink_back_rate: number;
          shimei_back_rate: number;
          douhan_back_rate: number;
          extension_back_rate: number;
          hourly_wage: number;
          is_active: boolean;
          profile_image_url: string | null;
          notes: string | null;
          user_id: string | null;
          today_checkin_at: string | null;
          today_checkout_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["casts"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["casts"]["Row"]>;
      };
      customers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          kana: string | null;
          phone: string | null;
          birthday: string | null;
          first_visit_date: string | null;
          last_visit_date: string | null;
          visit_count: number;
          total_spend: number;
          ng_notes: string | null;
          preference_notes: string | null;
          memo: string | null;
          tags: string[];
          is_vip: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["customers"]["Row"]>;
      };
      slips: {
        Row: {
          id: string;
          store_id: string;
          table_id: string | null;
          customer_id: string | null;
          slip_number: string;
          name: string | null;
          status: "open" | "closed" | "voided" | "locked";
          opened_at: string;
          closed_at: string | null;
          set_minutes: number;
          set_price: number;
          extension_minutes: number;
          extension_price: number;
          extension_count: number;
          timer_started_at: string | null;
          subtotal: number;
          tax_amount: number;
          service_amount: number;
          total_amount: number;
          payment_method: "cash" | "card" | "other" | null;
          is_locked: boolean;
          lock_reason: string | null;
          created_by: string | null;
          closed_by: string | null;
          business_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["slips"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["slips"]["Row"]>;
      };
      slip_items: {
        Row: {
          id: string;
          slip_id: string;
          product_id: string | null;
          product_name: string;
          product_price: number;
          quantity: number;
          subtotal: number;
          cast_id: string | null;
          item_type: "product" | "set" | "extension" | "shimei" | "douhan";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["slip_items"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["slip_items"]["Row"]>;
      };
      slip_casts: {
        Row: {
          id: string;
          slip_id: string;
          cast_id: string;
          role: "main" | "help" | "shimei";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["slip_casts"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["slip_casts"]["Row"]>;
      };
      operation_logs: {
        Row: {
          id: string;
          store_id: string;
          user_id: string | null;
          slip_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          before_data: Json | null;
          after_data: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["operation_logs"]["Row"], "id" | "created_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["operation_logs"]["Row"]>;
      };
      daily_sales: {
        Row: {
          id: string;
          store_id: string;
          business_date: string;
          total_slips: number;
          total_revenue: number;
          total_customers: number;
          avg_spend_per_customer: number;
          product_summary: Json;
          cast_summary: Json;
          hourly_summary: Json;
          is_closed: boolean;
          closed_at: string | null;
          closed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["daily_sales"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["daily_sales"]["Row"]>;
      };
    };
  };
};

// 便利な型エイリアス
export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type StoreUser = Database["public"]["Tables"]["store_users"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductCategory = Database["public"]["Tables"]["product_categories"]["Row"];
export type Table = Database["public"]["Tables"]["tables"]["Row"];
export type Cast = Database["public"]["Tables"]["casts"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type Slip = Database["public"]["Tables"]["slips"]["Row"];
export type SlipItem = Database["public"]["Tables"]["slip_items"]["Row"];
export type SlipCast = Database["public"]["Tables"]["slip_casts"]["Row"];
export type OperationLog = Database["public"]["Tables"]["operation_logs"]["Row"];
export type DailySales = Database["public"]["Tables"]["daily_sales"]["Row"];
