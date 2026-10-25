"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export interface FloatingCartBarProps {
  /** Optional manual override for item count. If omitted, uses useCart().count */
  itemCount?: number;
  /** Primary title (defaults to "MAGADI GREENS") */
  title?: string;
  /** Subtitle link text (defaults to "View Menu") */
  subtitle?: string;
  /** Subtitle target anchor / href */
  subtitleHref?: string;
  /** 48x48 Circular thumbnail image URL */
  thumbnail?: string;
  /** Handler when "View Cart" button is clicked. If omitted, opens CartDrawer via useCart() */
  onViewCart?: () => void;
  /** Handler when dismissed. If omitted, internal dismiss state is toggled */
  onDismiss?: () => void;
  /** Custom wrapper CSS classes */
  className?: string;
}

const DEFAULT_THUMB =
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=120&auto=format&fit=crop&q=80";

/**
 * Standalone, reusable floating bottom cart bar component that stays fixed at
 * the bottom center of the screen (bottom: 20px, z-index: 50) when the cart has
 * 1 or more items.
 */
export function FloatingCartBar({
  itemCount,
  title = "MAGADI GREENS",
  subtitle = "View Menu",
  subtitleHref = "#menu",
  thumbnail,
  onViewCart,
  onDismiss,
  className,
}: FloatingCartBarProps) {
  const cart = useCart();
  const effectiveCount = itemCount !== undefined ? itemCount : cart.count;
  const reduce = useReducedMotion();

  const [dismissed, setDismissed] = useState(false);
  const [lastCount, setLastCount] = useState(effectiveCount);

  // If the item count increases, automatically un-dismiss the bar
  if (effectiveCount !== lastCount) {
    if (effectiveCount > lastCount) {
      setDismissed(false);
    }
    setLastCount(effectiveCount);
  }

  // Derive thumbnail image if not provided
  const activeThumbnail =
    thumbnail ||
    (cart.lines.length > 0 ? "/images/mangoes.jpg" : DEFAULT_THUMB);

  function handleOpenCart() {
    if (onViewCart) {
      onViewCart();
    } else {
      cart.setOpen(true);
    }
  }

  function handleClose(e: React.MouseEvent) {
    e.stopPropagation();
    if (onDismiss) {
      onDismiss();
    } else {
      setDismissed(true);
    }
  }

  const isVisible = effectiveCount > 0 && !dismissed;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="floatingCart"
          role="region"
          aria-label="Floating cart summary"
          initial={{ y: reduce ? 0 : 50, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: reduce ? 0 : 40, opacity: 0, x: "-50%" }}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className={cn(
            "fixed bottom-5 left-1/2 z-50 max-w-[calc(100vw-24px)] select-none",
            className,
          )}
        >
          {/* Outer Pill Container */}
          <div
            className={cn(
              "flex items-center gap-3 rounded-full p-2 pr-2.5 transition-shadow duration-300",
              "bg-white dark:bg-[#23252d]",
              "border border-black/10 dark:border-white/10",
              "shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
            )}
          >
            {/* Left 48x48 Circular Thumbnail */}
            <img
              src={activeThumbnail}
              alt="Item Thumbnail"
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover bg-black/10"
              onError={(e) => {
                // Fallback to default thumbnail on broken image
                (e.currentTarget as HTMLImageElement).src = DEFAULT_THUMB;
              }}
            />

            {/* Middle Text Stack */}
            <div className="flex min-w-[110px] flex-col justify-center pr-2">
              <span className="whitespace-nowrap text-base font-bold leading-tight text-gray-900 dark:text-white">
                {title}
              </span>
              <a
                href={subtitleHref}
                className="mt-0.5 inline-flex items-center gap-1 text-[13.5px] font-medium text-gray-600 transition-opacity hover:opacity-80 dark:text-gray-300"
              >
                {subtitle}
                <span className="text-xs text-[#db545a]" aria-hidden>
                  &#9656;
                </span>
              </a>
            </div>

            {/* Right Coral-Red CTA Button */}
            <button
              type="button"
              onClick={handleOpenCart}
              className={cn(
                "flex shrink-0 flex-col items-center justify-center rounded-full px-5 py-2 text-white",
                "bg-[#db545a] hover:bg-[#c9464c] active:scale-95 transition-all duration-150 cursor-pointer",
              )}
            >
              <span className="text-[15px] font-bold leading-tight">View Cart</span>
              <span className="text-xs font-normal text-white/90">
                {effectiveCount} {effectiveCount === 1 ? "item" : "items"}
              </span>
            </button>

            {/* Far Right Circular Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close cart bar"
              className={cn(
                "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full cursor-pointer",
                "bg-gray-100 text-gray-500 hover:opacity-80 transition-opacity",
                "dark:bg-[#17181e] dark:text-gray-400",
              )}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
