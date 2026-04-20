import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import type { StoreUser, Store } from "@/types/database";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const users = await sql`
            SELECT su.*, s.id as store_db_id, s.name as store_name,
                   s.plan, s.tax_rate, s.service_rate, s.tax_type,
                   s.service_type, s.daily_slip_limit, s.created_at as store_created_at,
                   su.cast_id
            FROM store_users su
            JOIN stores s ON s.id = su.store_id
            WHERE su.email = ${credentials.email} AND su.is_active = true
            LIMIT 1
          ` as (StoreUser & { store_name: string; plan: string; tax_rate: number; service_rate: number; tax_type: string; service_type: string; daily_slip_limit: number; cast_id: string | null })[];

          if (!users.length) return null;
          const user = users[0];

          const valid = await bcrypt.compare(credentials.password, user.password_hash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            storeId: user.store_id,
            storeName: user.store_name,
            plan: user.plan,
            taxRate: user.tax_rate,
            serviceRate: user.service_rate,
            taxType: user.tax_type,
            serviceType: user.service_type,
            dailySlipLimit: user.daily_slip_limit,
            castId: user.cast_id ?? null,
          };
        } catch (err) {
          console.error("[Auth Error]", err);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.storeId = (user as { storeId: string }).storeId;
        token.storeName = (user as { storeName: string }).storeName;
        token.plan = (user as { plan: string }).plan;
        token.taxRate = (user as { taxRate: number }).taxRate;
        token.serviceRate = (user as { serviceRate: number }).serviceRate;
        token.taxType = (user as { taxType: string }).taxType;
        token.serviceType = (user as { serviceType: string }).serviceType;
        token.dailySlipLimit = (user as { dailySlipLimit: number }).dailySlipLimit;
        token.castId = (user as { castId: string | null }).castId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.storeId = token.storeId as string;
        session.user.storeName = token.storeName as string;
        session.user.plan = token.plan as string;
        session.user.taxRate = token.taxRate as number;
        session.user.serviceRate = token.serviceRate as number;
        session.user.taxType = token.taxType as string;
        session.user.serviceType = token.serviceType as string;
        session.user.dailySlipLimit = token.dailySlipLimit as number;
        session.user.castId = (token.castId as string | null) ?? null;
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
