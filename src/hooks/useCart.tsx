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

interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Flight {
  id: number;
  src: string | null;
  from: RectLike;
  to: RectLike;
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

      if (!fromEl || reduce) {
        setBounce((b) => b + 1);
        return;
      }

      // Capture starting position immediately at click time
      const fromRect = fromEl.getBoundingClientRect();

      // Delay by one animation frame to allow FloatingCartBar to mount if count was 0
      requestAnimationFrame(() => {
        const targetEl = document.getElementById("floating-cart-target");
        let toRect: RectLike;

        if (targetEl) {
          const rect = targetEl.getBoundingClientRect();
          // Account for entrance slide offset if floatingCart is still animating in (y: 28 -> 0)
          const cartBar = document.getElementById("floatingCart");
          let offsetY = 0;
          if (cartBar) {
            const transform = window.getComputedStyle(cartBar).transform;
            if (transform && transform !== "none") {
              try {
                const matrix = new DOMMatrixReadOnly(transform);
                offsetY = matrix.m42;
              } catch {
                /* ignore */
              }
            }
          }
          toRect = {
            left: rect.left,
            top: rect.top - offsetY,
            width: rect.width || 40,
            height: rect.height || 40,
          };
        } else {
          // Fallback point at the bottom-centre of viewport if target element is not found
          const w = 40;
          const h = 40;
          const fallbackX = window.innerWidth / 2 - 100;
          const fallbackY = window.innerHeight - 48;
          toRect = {
            left: fallbackX - w / 2,
            top: fallbackY - h / 2,
            width: w,
            height: h,
          };
        }

        const id = ++flightId.current;
        setFlights((f) => [
          ...f,
          {
            id,
            src: p.image ?? null,
            from: fromRect,
            to: toRect,
          },
        ]);
      });
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
            const liftY = Math.min(sy - 32, ey - 60);

            return (
              <motion.div
                key={f.id}
                className="absolute left-0 top-0 h-14 w-14 overflow-hidden rounded-full bg-secondary shadow-lift ring-2 ring-card"
                initial={{ x: sx, y: sy, scale: 1, opacity: 1 }}
                animate={{
                  x: [
                    sx,
                    sx + (ex - sx) * 0.22,
                    sx + (ex - sx) * 0.75,
                    ex + (sx > ex ? -3 : 3),
                    ex,
                  ],
                  y: [sy, liftY, sy + (ey - sy) * 0.72, ey + 4, ey],
                  scale: [1, 0.85, 0.6, 0.35],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  x: { duration: 1.1, ease: [0.22, 1, 0.36, 1], times: [0, 0.28, 0.72, 0.92, 1.0] },
                  y: { duration: 1.1, ease: [0.22, 1, 0.36, 1], times: [0, 0.28, 0.72, 0.92, 1.0] },
                  scale: { duration: 1.1, ease: [0.22, 1, 0.36, 1], times: [0, 0.35, 0.75, 1.0] },
                  opacity: { duration: 1.1, ease: "linear", times: [0, 0.8, 1.0] },
                }}
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
