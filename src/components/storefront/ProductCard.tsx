"use client";

import React, { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import type { Product } from "@/types";
import { ProductImage } from "./ProductImage";
import { AnimatedQty } from "./AnimatedQty";
import { useCart } from "@/hooks/useCart";
import { formatQty, rupee, stepFor } from "@/lib/format";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 400, damping: 25 };

export const ProductCard = React.memo(function ProductCard({
  product: p,
  index,
  isHighlighted = false,
  onHighlightEnd,
}: {
  product: Product;
  index: number;
  isHighlighted?: boolean;
  onHighlightEnd?: () => void;
}) {
  const { add, qtyOf, setQty } = useCart();
  const imgRef = useRef<HTMLDivElement>(null);
  const qty = qtyOf(p.id);
  const out = !p.inStock;
  const showMrp = p.price != null && p.mrp != null && p.mrp > p.price;

  return (
    <motion.article
      id={`product-card-${p.id}`}
      onAnimationEnd={onHighlightEnd}
      whileHover={out ? {} : { y: -4, scale: 1.015, transition: spring }}
      whileTap={out ? {} : { scale: 0.98 }}
      style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}
      className={cn(
        "card-intrinsic group flex flex-col rounded-2xl border border-border/70 bg-card shadow-card transition-shadow duration-200",
        !out && "elevate-hover",
        out && "opacity-60 grayscale",
        isHighlighted && "animate-target-card-glow z-20 relative ring-2 ring-primary",
      )}
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        <ProductImage
          ref={imgRef}
          src={p.image}
          alt={p.name}
          className="img-glow aspect-square w-full bg-sheen"
        />
        <AnimatePresence>
          {p.discount > 0 && p.price != null && !out && (
            <motion.span
              key="d"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={spring}
              className="absolute left-2 top-2 rounded-full bg-sale px-2 py-0.5 text-[11px] font-bold text-sale-foreground shadow-card"
            >
              {p.discount}% OFF
            </motion.span>
          )}
          {out && (
            <motion.span
              key="o"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={spring}
              className="absolute left-2 top-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[11px] font-semibold text-background"
            >
              Out of stock
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {p.kn && <span className="text-[11px] font-medium text-muted-foreground">{p.kn}</span>}
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{p.name}</h3>
        <p className="text-xs text-muted-foreground">per {p.unit}</p>

        <div className="mt-auto flex items-baseline gap-1.5 pt-1">
          {p.price != null ? (
            <>
              <span className="text-lg font-bold text-primary-deep">{rupee(p.price)}</span>
              <span className="text-xs text-muted-foreground">/ {p.unit}</span>
              {showMrp && (
                <span className="text-xs text-muted-foreground line-through">
                  {rupee(p.mrp!)}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">Price at store</span>
          )}
        </div>

        {qty > 0 && !out ? (
          <div className="mt-2 flex h-11 items-center justify-between rounded-xl bg-secondary">
            <motion.button
              whileTap={{ scale: 0.85 }}
              aria-label={`Less ${p.name}`}
              onClick={() => setQty(p.id, +(qty - stepFor(p.unit)).toFixed(2))}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-deep cursor-pointer"
            >
              <Minus className="h-4 w-4" />
            </motion.button>
            <AnimatedQty
              value={qty}
              label={formatQty(qty, p.unit)}
              className="text-sm font-semibold text-primary-deep"
            />
            <motion.button
              whileTap={{ scale: 0.85 }}
              aria-label={`More ${p.name}`}
              onClick={() => add(p, imgRef.current)}
              className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-deep cursor-pointer"
            >
              <Plus className="h-4 w-4" />
            </motion.button>
          </div>
        ) : (
          <motion.button
            whileTap={out ? {} : { scale: 0.94 }}
            disabled={out}
            onClick={() => add(p, imgRef.current)}
            className="mt-2 flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-card cursor-pointer disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" /> {out ? "Unavailable" : "Add"}
          </motion.button>
        )}
      </div>
    </motion.article>
  );
});

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card">
      <div className="shimmer aspect-square w-full bg-muted" />
      <div className="space-y-2 p-3">
        <div className="shimmer h-4 w-3/4 rounded bg-muted" />
        <div className="shimmer h-3 w-1/3 rounded bg-muted" />
        <div className="shimmer h-11 w-full rounded-xl bg-muted" />
      </div>
    </div>
  );
}
