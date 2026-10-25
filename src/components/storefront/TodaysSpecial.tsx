"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useSpecials, type Special } from "@/lib/use-specials";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ProductThumb } from "./ProductThumb";
import type { Product } from "@/lib/catalogue-client";

type Props = { products: Product[] };

/** Resolves display values for a slot, falling back to its linked product. */
function resolve(s: Special, byId: Map<number, Product>) {
  const p = s.productId != null ? byId.get(s.productId) : undefined;
  return {
    title: s.title || p?.name || "Today's special",
    img: s.img || p?.img || null,
    priceText: s.priceText,
    label: s.label,
    kn: p?.kn || "",
  };
}

/**
 * "Today's Special" – an eye-catching, swipeable horizontal carousel of 1–6
 * highlighted cards. The whole section is hidden when there are no slots.
 */
export function TodaysSpecial({ products }: Props) {
  const { specials } = useSpecials();
  const reduce = useReducedMotion();
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  if (specials.length === 0) return null;

  return (
    <section aria-label="Today's Special" className="mt-5">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="grid size-7 place-items-center rounded-full bg-badge/15 text-badge">
          <Sparkles className="size-4" />
        </span>
        <h2 className="text-lg font-extrabold tracking-tight text-g900">Today&apos;s Special</h2>
      </div>

      <div
        style={{
          scrollPadding: "1rem",
          display: "flex",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          gap: "12px",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%)",
        }}
        className="no-scrollbar mask-edge-fade -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
      >
        {specials.map((s, i) => {
          const v = resolve(s, byId);
          return (
            <motion.article
              key={s.id}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.06, 0.3) }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              className="relative flex w-[260px] flex-none snap-start flex-col overflow-hidden rounded-2xl border border-g100 bg-white shadow-sm shadow-g900/5"
            >
              <div className="relative h-36 w-full">
                <ProductThumb src={v.img} alt={v.title} className="h-full w-full" big />
                {v.label && (
                  <span className="absolute left-2 top-2 rounded-full bg-badge px-2.5 py-1 text-[11px] font-bold text-white shadow">
                    {v.label}
                  </span>
                )}
                <span className="absolute right-2 top-2 rounded-full bg-g900/90 px-2.5 py-1 text-[11px] font-bold text-white">
                  Special
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3">
                {v.kn && <span className="text-[11.5px] text-mute">{v.kn}</span>}
                <h3 className="text-[15px] font-bold leading-snug text-ink">{v.title}</h3>
                {v.priceText && (
                  <div className="mt-auto pt-2 text-[18px] font-extrabold text-g700">
                    {v.priceText}
                  </div>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
