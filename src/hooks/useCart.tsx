"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { CartLine, Product } from "@/types";
import { stepFor } from "@/lib/format";

const STORAGE_KEY = "mg_cart_v1";

interface CartActionsCtx {
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  replaceLines: (lines: CartLine[]) => void;
  clear: () => void;
  setOpen: (o: boolean) => void;
}

interface CartStateCtx {
  lines: CartLine[];
  count: number;
  open: boolean;
  qtyOf: (id: string) => number;
}

export interface CartCtx extends CartStateCtx, CartActionsCtx {}

interface CartStore {
  subscribe: (listener: () => void) => () => void;
  getQty: (id: string) => number;
}

const CartActionsContext = createContext<CartActionsCtx | null>(null);
const CartStateContext = createContext<CartStateCtx | null>(null);
const CartStoreContext = createContext<CartStore | null>(null);
const CartOpenContext = createContext<boolean>(false);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  // Store & listeners for fine-grained per-product subscriptions
  const linesRef = useRef(lines);

  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const listenersRef = useRef(new Set<() => void>());

  const notify = useCallback(() => {
    listenersRef.current.forEach((l) => l());
  }, []);

  const store = useMemo<CartStore>(
    () => ({
      subscribe: (listener: () => void) => {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
      getQty: (id: string) => {
        return linesRef.current.find((l) => l.productId === id)?.qty ?? 0;
      },
    }),
    [],
  );

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setLines(parsed);
          linesRef.current = parsed;
          notify();
        }
      } catch {
        /* ignore corrupt cart */
      }
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [notify]);

  // Persist cart to localStorage
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore quota errors */
    }
  }, [lines, loaded]);

  const add = useCallback(
    (p: Product) => {
      if (!p.inStock) return;

      setLines((prev) => {
        const ex = prev.find((l) => l.productId === p.id);
        const next = ex
          ? prev.map((l) =>
              l.productId === p.id ? { ...l, qty: +(l.qty + stepFor(p.unit)).toFixed(2) } : l,
            )
          : [
              ...prev,
              {
                productId: p.id,
                qty: stepFor(p.unit),
                priceSnapshot: p.price,
                name: p.name,
                unit: p.unit,
                image: p.image ?? null,
              },
            ];
        linesRef.current = next;
        notify();
        return next;
      });
    },
    [notify],
  );

  const setQty = useCallback(
    (id: string, qty: number) => {
      setLines((prev) => {
        const next =
          qty <= 0
            ? prev.filter((l) => l.productId !== id)
            : prev.map((l) => (l.productId === id ? { ...l, qty: +qty.toFixed(2) } : l));
        linesRef.current = next;
        notify();
        return next;
      });
    },
    [notify],
  );

  const remove = useCallback(
    (id: string) => {
      setLines((prev) => {
        const next = prev.filter((l) => l.productId !== id);
        linesRef.current = next;
        notify();
        return next;
      });
    },
    [notify],
  );

  const replaceLines = useCallback(
    (newLines: CartLine[]) => {
      setLines(newLines);
      linesRef.current = newLines;
      notify();
    },
    [notify],
  );

  const clear = useCallback(() => {
    setLines([]);
    linesRef.current = [];
    notify();
  }, [notify]);

  const qtyOf = useCallback(
    (id: string) => lines.find((l) => l.productId === id)?.qty ?? 0,
    [lines],
  );

  // Actions context: stable callbacks that never trigger re-renders
  const actionsValue = useMemo<CartActionsCtx>(
    () => ({
      add,
      setQty,
      remove,
      replaceLines,
      clear,
      setOpen,
    }),
    [add, setQty, remove, replaceLines, clear],
  );

  // State context: lines and count (memoized)
  const stateValue = useMemo<CartStateCtx>(
    () => ({
      lines,
      count: lines.length,
      open,
      qtyOf,
    }),
    [lines, open, qtyOf],
  );

  return (
    <CartStoreContext.Provider value={store}>
      <CartOpenContext.Provider value={open}>
        <CartActionsContext.Provider value={actionsValue}>
          <CartStateContext.Provider value={stateValue}>
            {children}
          </CartStateContext.Provider>
        </CartActionsContext.Provider>
      </CartOpenContext.Provider>
    </CartStoreContext.Provider>
  );
}

/** Subscribe ONLY to whether the cart drawer is open. Avoids re-rendering on cart line changes. */
export function useCartDrawerOpen(): boolean {
  return useContext(CartOpenContext);
}

/** Stable cart actions (add, setQty, remove, clear, setOpen) that never re-render */
export function useCartActions() {
  const c = useContext(CartActionsContext);
  if (!c) throw new Error("useCartActions must be used inside CartProvider");
  return c;
}

/** Subscribe ONLY to a specific product's quantity. Skips re-render when other products change. */
export function useProductQty(id: string): number {
  const store = useContext(CartStoreContext);
  return useSyncExternalStore(
    store ? store.subscribe : () => () => {},
    () => (store ? store.getQty(id) : 0),
    () => 0,
  );
}

/** Full cart hook (for FloatingCartBar, Header, Drawer) */
export function useCart(): CartCtx {
  const actions = useCartActions();
  const state = useContext(CartStateContext);
  if (!state) throw new Error("useCart must be used inside CartProvider");
  return useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions],
  );
}
