"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Quantity in the cart. For kg items it can be 0.5, 1, 1.5, etc. */
type Cart = Record<number, number>;

type CartState = {
  cart: Cart;
  /** Increase quantity by one step. */
  add: (id: number, step: number, max: number) => void;
  /** Decrease quantity by one step; removes the line when it hits zero. */
  sub: (id: number, step: number) => void;
  /** Set the quantity directly (clamped). */
  setQty: (id: number, qty: number, step: number, max: number) => void;
  /** Drop an item from the cart. */
  remove: (id: number) => void;
  /** Drop every item that's not in `validIds` or whose product is sold out. */
  sanitize: (valid: Map<number, { stock: boolean; step: number; max: number }>) => number;
  /** Empty the cart. */
  clear: () => void;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cart: {},
      add: (id, step, max) =>
        set((s) => {
          const cur = s.cart[id] ?? 0;
          const next = Math.min(max, round2(cur + step));
          return { cart: { ...s.cart, [id]: next } };
        }),
      sub: (id, step) =>
        set((s) => {
          const cur = s.cart[id] ?? 0;
          const next = round2(cur - step);
          if (next <= 0.001) {
            const { [id]: _drop, ...rest } = s.cart;
            void _drop;
            return { cart: rest };
          }
          return { cart: { ...s.cart, [id]: next } };
        }),
      setQty: (id, qty, step, max) =>
        set((s) => {
          if (qty <= 0.001) {
            const { [id]: _drop, ...rest } = s.cart;
            void _drop;
            return { cart: rest };
          }
          const snapped = round2(Math.min(max, Math.max(step, Math.round(qty / step) * step)));
          return { cart: { ...s.cart, [id]: snapped } };
        }),
      remove: (id) =>
        set((s) => {
          const { [id]: _drop, ...rest } = s.cart;
          void _drop;
          return { cart: rest };
        }),
      sanitize: (valid) => {
        let dropped = 0;
        const next: Cart = {};
        for (const [idStr, qty] of Object.entries(get().cart)) {
          const id = Number(idStr);
          const p = valid.get(id);
          if (!p || !p.stock) {
            dropped++;
            continue;
          }
          const snapped = round2(Math.min(p.max, Math.max(p.step, Math.round(qty / p.step) * p.step)));
          if (snapped > 0) next[id] = snapped;
        }
        set({ cart: next });
        return dropped;
      },
      clear: () => set({ cart: {} }),
    }),
    { name: "mg_cart_v3" },
  ),
);
