"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShoppingBasket, X } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export interface FloatingCartBarProps {
  /** Optional manual override for item count. If omitted, uses useCart().count */
  itemCount?: number;
  /** Primary title / store name (e.g. "MAGADI GREENS") */
  title?: string;
  /** Subtitle link text (defaults to "View more veggies") */
  subtitle?: string;
  /** Subtitle target anchor / href (defaults to "#categories") */
  subtitleHref?: string;
  /** Thumbnail image URL */
  thumbnail?: string;
  /** Handler when "View Basket" is clicked */
  onViewCart?: () => void;
  /** Optional handler when clear/dismiss is clicked */
  onDismiss?: () => void;
  /** Custom wrapper CSS classes */
  className?: string;
}

export const CART_ROTATING_PHRASES = [
  "One more? 👀",
  "Add something fresh 🥬",
  "Missing something? 🤔",
  "Your basket needs more!",
  "Fresh picks await 🥑",
  "Keep it coming! 🛒",
  "A little more goodness ❤️",
  "Treat yourself today!",
];

// Fallback produce image for MAGADI GREENS
const DEFAULT_THUMB =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80";

/**
 * Custom organic floating cart bar unique to MAGADI GREENS.
 *
 * Features:
 * - Fresh forest green glassmorphic pill with emerald accent borders (not a food delivery clone).
 * - Rotating encouraging copy ("One more? 👀", "Add something fresh 🥬", etc.).
 * - Vibrant fresh-lime "View Basket" action button.
 * - Produces thumbnail with bounce micro-interaction on item add.
 */
export function FloatingCartBar({
  itemCount,
  title,
  subtitle = "View more veggies",
  subtitleHref = "#categories",
  thumbnail,
  onViewCart,
  onDismiss,
  className,
}: FloatingCartBarProps) {
  const cart = useCart();
  const effectiveCount = itemCount !== undefined ? itemCount : cart.count;
  const reduce = useReducedMotion();

  const phraseList = React.useMemo(() => {
    return title ? [title, ...CART_ROTATING_PHRASES] : CART_ROTATING_PHRASES;
  }, [title]);

  // Rotating phrase ticker
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    if (effectiveCount <= 0 || cart.open) return;
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % phraseList.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [effectiveCount, cart.open, phraseList.length]);

  // Thumbnail from latest cart line or default
  const latestCartImg = cart.lines[cart.lines.length - 1]?.image;
  const activeThumbnail = thumbnail || latestCartImg || DEFAULT_THUMB;

  function handleOpenCart() {
    if (onViewCart) {
      onViewCart();
    } else {
      cart.setOpen(true);
    }
  }

  function handleClose(e: React.MouseEvent) {
    e.stopPropagation();
    cart.clear();
    onDismiss?.();
  }

  function handleScrollToCategories(e: React.MouseEvent) {
    e.preventDefault();
    const targetId = subtitleHref.replace("#", "") || "categories";
    const el = document.getElementById(targetId) || document.getElementById("menu");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const isVisible = effectiveCount > 0 && !cart.open;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="floatingCart"
          role="region"
          aria-label="Floating cart summary"
          initial={{ y: reduce ? 0 : 28, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduce ? 0 : 20, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: "max(20px, env(safe-area-inset-bottom))",
            zIndex: 50,
            display: "flex",
            justifyContent: "center",
            padding: "0 8px sm:px-3",
            pointerEvents: "none",
            willChange: "transform, opacity",
          }}
          className={cn("select-none", className)}
        >
          <div style={{ width: "100%", maxWidth: "480px", pointerEvents: "auto" }}>
            {/* Organic Forest Green Glass Island */}
            <div
              className={cn(
                "relative flex items-center justify-between gap-2 sm:gap-2.5 rounded-full",
                "bg-[#0d2e1b] text-white",
                "border border-emerald-500/30",
                "py-2 px-2 sm:py-2.5 sm:px-3 pl-2 sm:pl-2.5",
                "shadow-[0_16px_36px_rgba(7,29,17,0.48)]",
                "backdrop-blur-xl",
              )}
            >
              {/* Left Fresh Produce Badge */}
              <div id="floating-cart-target" className="relative shrink-0">
                <motion.div
                  animate={cart.bounce > 0 ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover ring-2 ring-emerald-400/40 bg-emerald-950 overflow-hidden flex items-center justify-center shadow-inner"
                >
                  <img
                    src={activeThumbnail}
                    alt="Fresh Produce"
                    width={40}
                    height={40}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_THUMB;
                    }}
                  />
                </motion.div>
              </div>

              {/* Middle Rotating Message + Browse Subtitle */}
              <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center px-0.5">
                <div className="h-[26px] min-h-[26px] overflow-hidden relative flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={phraseIndex}
                      initial={{ y: reduce ? 0 : 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: reduce ? 0 : -8, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="block text-[12.5px] sm:text-[14px] font-bold text-white tracking-tight truncate whitespace-nowrap leading-[1.35] pb-[1px]"
                    >
                      {phraseList[phraseIndex] ?? phraseList[0]}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <a
                  href={subtitleHref}
                  onClick={handleScrollToCategories}
                  className="inline-flex items-center gap-1 text-[11px] sm:text-[11.5px] font-semibold text-emerald-300/90 hover:text-emerald-200 transition-colors cursor-pointer mt-0.5 leading-[1.3] pb-[2px] max-w-full"
                >
                  <span className="truncate leading-[1.3] pb-[1px]">{subtitle}</span>
                  <span className="text-xs text-[#aaff00] shrink-0 leading-none" aria-hidden>
                    ▸
                  </span>
                </a>
              </div>

              {/* Right Compact Action Button: says only "Basket" */}
              <button
                type="button"
                onClick={handleOpenCart}
                className={cn(
                  "flex items-center gap-1.5 rounded-full",
                  "bg-gradient-to-r from-[#aaff00] to-[#8ee800] text-[#092213]",
                  "px-2.5 py-2 sm:px-3 sm:py-2",
                  "font-extrabold text-[12px] sm:text-[13px]",
                  "shadow-sm shadow-[#aaff00]/25",
                  "hover:brightness-105 active:scale-95 transition-all cursor-pointer shrink-0",
                )}
              >
                <span className="whitespace-nowrap">Basket</span>
                <motion.span
                  key={`badge-${cart.bounce}`}
                  animate={cart.bounce > 0 ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#092213] px-1 text-[10px] font-bold text-[#aaff00]"
                >
                  {effectiveCount}
                </motion.span>
              </button>

              {/* Discreet Empty Cart (×) Button */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Empty basket"
                title="Empty basket"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
