import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/nextauth";
import AppShell from "@/components/layout/AppShell";
import type { StoreUser, Store } from "@/types/database";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const u = session.user;

  // StoreUser・Store型に変換
  const storeUser: StoreUser = {
    id: u.id,
    store_id: u.storeId,
    auth_user_id: u.id,
    email: u.email ?? "",
    name: u.name ?? "",
    role: u.role as "admin" | "manager" | "staff",
    pin_code: null,
    is_active: true,
    last_login_at: null,
    cast_id: u.castId ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    password_hash: "",
  };

  const store: Store = {
    id: u.storeId,
    name: u.storeName,
    plan: u.plan as "standard" | "premium",
    plan_expires_at: null,
    stripe_customer_id: null,
    stripe_subscription_id: null,
    tax_rate: u.taxRate,
    service_rate: u.serviceRate,
    tax_type: u.taxType as "percent" | "fixed",
    service_type: u.serviceType as "percent" | "fixed",
    daily_slip_limit: u.dailySlipLimit,
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return <AppShell storeUser={storeUser} store={store}>{children}</AppShell>;
}
