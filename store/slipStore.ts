import { create } from "zustand";
import type { Slip, SlipItem } from "@/types/database";

interface SlipState {
  activeSlip: (Slip & { items: SlipItem[] }) | null;
  setActiveSlip: (slip: (Slip & { items: SlipItem[] }) | null) => void;
  updateItem: (itemId: string, quantity: number) => void;
}

export const useSlipStore = create<SlipState>((set) => ({
  activeSlip: null,
  setActiveSlip: (slip) => set({ activeSlip: slip }),
  updateItem: (itemId, quantity) =>
    set((state) => {
      if (!state.activeSlip) return state;
      const items = state.activeSlip.items.map((item) =>
        item.id === itemId
          ? { ...item, quantity, subtotal: item.product_price * quantity }
          : item
      );
      return { activeSlip: { ...state.activeSlip, items } };
    }),
}));
