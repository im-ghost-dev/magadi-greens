"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CartLine, Product } from "@/types";
import { stepFor } from "@/lib/format";

const STORAGE_KEY = "mg_cart_v1";

interface Flight {
  id: number;
  src: string | null;
  from: DOMRect;
  to: DOMRect;
}

interface CartCtx {
  lines: CartLine[];
  count: number;
  bounce: number;
  qtyOf: (id: string) => number;
  add: (p: Product, fromEl?: HTMLElement | null) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  replaceLines: (lines: CartLine[]) => void;
  clear: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [bounce, setBounce] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const flightId = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setLines(JSON.parse(raw));
      } catch {
        /* ignore corrupt cart */
      }
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, loaded]);

  const qtyOf = useCallback(
    (id: string) => lines.find((l) => l.productId === id)?.qty ?? 0,
    [lines],
  );

  const add = useCallback(
    (p: Product, fromEl?: HTMLElement | null) => {
      if (!p.inStock) return;
      setLines((prev) => {
        const ex = prev.find((l) => l.productId === p.id);
        if (ex)
          return prev.map((l) =>
            l.productId === p.id ? { ...l, qty: +(l.qty + stepFor(p.unit)).toFixed(2) } : l,
          );
        return [
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
      });
      const badge = document.getElementById("cart-badge-target");
      if (fromEl && badge && !reduce) {
        const id = ++flightId.current;
        setFlights((f) => [
          ...f,
          {
            id,
            src: p.image ?? null,
            from: fromEl.getBoundingClientRect(),
            to: badge.getBoundingClientRect(),
          },
        ]);
      } else {
        setBounce((b) => b + 1);
      }
    },
    [reduce],
  );

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.productId !== id)
        : prev.map((l) => (l.productId === id ? { ...l, qty: +qty.toFixed(2) } : l)),
    );
  }, []);

  const remove = useCallback(
    (id: string) => setLines((p) => p.filter((l) => l.productId !== id)),
    [],
  );

  return (
    <Ctx.Provider
      value={{
        lines,
        count: lines.length,
        bounce,
        qtyOf,
        add,
        setQty,
        remove,
        replaceLines: setLines,
        clear: () => setLines([]),
        open,
        setOpen,
      }}
    >
      {children}
      <div className="pointer-events-none fixed inset-0 z-[60]">
        <AnimatePresence>
          {flights.map((f) => {
            const size = 56;
            const sx = f.from.left + f.from.width / 2 - size / 2;
            const sy = f.from.top + f.from.height / 2 - size / 2;
            const ex = f.to.left + f.to.width / 2 - size / 2;
            const ey = f.to.top + f.to.height / 2 - size / 2;
            return (
              <motion.div
                key={f.id}
                className="absolute left-0 top-0 h-14 w-14 overflow-hidden rounded-full bg-secondary shadow-lift ring-2 ring-card"
                initial={{ x: sx, y: sy, scale: 1, opacity: 1 }}
                animate={{
                  x: [sx, (sx + ex) / 2, ex],
                  y: [sy, Math.min(sy, ey) - 80, ey],
                  scale: [1, 0.8, 0.3],
                  opacity: [1, 1, 0.6],
                }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
                onAnimationComplete={() => {
                  setFlights((all) => all.filter((x) => x.id !== f.id));
                  setBounce((b) => b + 1);
                }}
              >
                {f.src ? (
                  <img src={f.src} alt="" className="h-full w-full object-cover" />
                ) : null}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
