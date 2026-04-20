import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    storeId: string;
    storeName: string;
    plan: string;
    taxRate: number;
    serviceRate: number;
    taxType: string;
    serviceType: string;
    dailySlipLimit: number;
    castId: string | null;
  }
  interface Session {
    user: User & {
      id: string;
      role: string;
      storeId: string;
      storeName: string;
      plan: string;
      taxRate: number;
      serviceRate: number;
      taxType: string;
      serviceType: string;
      dailySlipLimit: number;
      castId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    storeId: string;
    storeName: string;
    plan: string;
    taxRate: number;
    serviceRate: number;
    taxType: string;
    serviceType: string;
    dailySlipLimit: number;
    castId: string | null;
  }
}
