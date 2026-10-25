"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Special } from "@/types";
import { ProductImage } from "./ProductImage";

/** Swipeable, snap-scrolling "Today's Special" strip with parallax and an enlarged active card. Hidden when empty. */
export function SpecialsCarousel({
  specials,
  onSelectSpecial,
}: {
  specials: Special[];
  onSelectSpecial?: (special: Special) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState(0);
  const [active, setActive] = useState(0);
  const [cardWidth, setCardWidth] = useState(300);
  const raf = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (ref.current?.firstElementChild) {
      setCardWidth((ref.current.firstElementChild as HTMLElement).offsetWidth + 12);
    }
  }, [specials.length]);

  if (specials.length === 0) return null;

  function onScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      setScroll(el.scrollLeft);
      const first = el.children[0] as HTMLElement | undefined;
      const w = first ? first.offsetWidth + 12 : 300;
      setCardWidth(w);
      setActive(Math.min(specials.length - 1, Math.round(el.scrollLeft / w)));
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: reduce ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: reduce ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-6xl pt-6"
      aria-label="Today's special"
    >
      <h2 className="flex items-center gap-2 px-4 text-lg font-semibold text-primary-deep">
        <Sparkles className="h-5 w-5 text-sale" /> Today&apos;s Special
      </h2>
      <div
        ref={ref}
        onScroll={onScroll}
        style={{
          display: "flex",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          gap: "10px",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%)",
        }}
        className="no-scrollbar mask-edge-fade mt-3 flex snap-x snap-mandatory gap-[10px] overflow-x-auto overscroll-x-contain px-4 pb-4 pt-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {specials.map((s, i) => {
          const offset = i * cardWidth - scroll;
          const isActive = i === active;
          const priceDisplay = s.priceText || (s.price != null ? `₹${s.price}` : "");

          return (
            <motion.article
              key={s.id}
              onClick={() => onSelectSpecial?.(s)}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: reduce ? 0 : 24 }}
              animate={{ opacity: 1, x: 0, scale: isActive || reduce ? 1 : 0.95 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 26,
                delay: reduce ? 0 : 0.15 + i * 0.05,
              }}
              className="relative h-44 w-[82%] max-w-sm shrink-0 flex-shrink-0 snap-start overflow-hidden rounded-2xl bg-primary-deep shadow-elev-md sm:h-52 cursor-pointer active:scale-[0.98] transition-transform select-none whitespace-nowrap"
            >
              <div
                className="absolute inset-y-0 -left-8 -right-8 will-change-transform"
                style={{ transform: reduce ? undefined : `translate3d(${offset * -0.12}px,0,0)` }}
              >
                <ProductImage src={s.image} alt={s.title} className="h-full w-full" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-deep/90 via-primary-deep/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
                <div className="min-w-0">
                  <span className="rounded-full bg-sale px-2.5 py-0.5 text-[11px] font-semibold text-sale-foreground whitespace-nowrap">
                    {s.label || "Fresh today"}
                  </span>
                  <h3 className="mt-1.5 truncate text-lg font-semibold text-primary-foreground whitespace-nowrap">
                    {s.title}
                  </h3>
                </div>
                {priceDisplay && (
                  <span className="shrink-0 flex-shrink-0 whitespace-nowrap rounded-xl bg-card px-3 py-1.5 text-lg font-bold text-primary-deep shadow-card">
                    {priceDisplay}
                  </span>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
      {specials.length > 1 && (
        <div className="flex justify-center gap-1.5" aria-hidden>
          {specials.map((s, i) => (
            <motion.span
              key={s.id}
              animate={{ scaleX: i === active ? 2.2 : 1, opacity: i === active ? 1 : 0.35 }}
              className="h-1.5 w-1.5 origin-center rounded-full bg-primary"
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}
