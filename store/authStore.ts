import { create } from "zustand";
import type { StoreUser, Store } from "@/types/database";

interface AuthState {
  storeUser: StoreUser | null;
  store: Store | null;
  setStoreUser: (user: StoreUser | null) => void;
  setStore: (store: Store | null) => void;
  isAdmin: () => boolean;
  isPremium: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  storeUser: null,
  store: null,
  setStoreUser: (user) => set({ storeUser: user }),
  setStore: (store) => set({ store }),
  isAdmin: () => {
    const { storeUser } = get();
    return storeUser?.role === "admin" || storeUser?.role === "manager";
  },
  isPremium: () => {
    const { store } = get();
    return store?.plan === "premium";
  },
}));
