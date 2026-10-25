"use client";

import React, { useState } from "react";
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
 * Reusable floating bottom cart bar component fixed at bottom: 20px, z-index: 50.
 * Automatically hidden when cart count is 0 or when the cart drawer is open.
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

  // If new items are added, automatically un-dismiss the bar
  if (effectiveCount !== lastCount) {
    if (effectiveCount > lastCount) {
      setDismissed(false);
    }
    setLastCount(effectiveCount);
  }

  // Derive thumbnail from the most recent cart item image, or prop, or default
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
    if (onDismiss) {
      onDismiss();
    } else {
      setDismissed(true);
    }
  }

  // Hidden when empty, dismissed, or when the cart drawer is open
  const isVisible = effectiveCount > 0 && !dismissed && !cart.open;

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
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            width: "calc(100vw - 24px)",
            maxWidth: "420px",
          }}
          className={cn("select-none", className)}
        >
          {/* Pill Container */}
          <div
            style={{
              borderRadius: "9999px",
              padding: "8px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
            className={cn(
              "w-full transition-shadow duration-300",
              "bg-white dark:bg-[#23252d]",
              "border border-black/10 dark:border-white/10",
              "shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
            )}
          >
            {/* Left 48px x 48px Circular Thumbnail */}
            <img
              src={activeThumbnail}
              alt={title}
              width={48}
              height={48}
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
              }}
              className="bg-black/10"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_THUMB;
              }}
            />

            {/* Middle Text Stack with truncate so it never collides on mobile */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                className="block text-base font-bold leading-tight text-gray-900 dark:text-white"
              >
                {title}
              </span>
              <a
                href={subtitleHref}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                className="mt-0.5 inline-flex items-center gap-1 text-[13.5px] font-medium text-gray-600 transition-opacity hover:opacity-80 dark:text-gray-300"
              >
                {subtitle}
                <span className="text-xs text-[#db545a]" aria-hidden>
                  &#9656;
                </span>
              </a>
            </div>

            {/* Right Coral-Red Pill CTA Button */}
            <button
              type="button"
              onClick={handleOpenCart}
              style={{
                backgroundColor: "#db545a",
                borderRadius: "9999px",
                padding: "8px 18px",
                flexShrink: 0,
              }}
              className="flex flex-col items-center justify-center text-white transition hover:bg-[#c9464c] active:scale-95 cursor-pointer"
            >
              <span className="text-[15px] font-bold leading-tight whitespace-nowrap">
                View Cart
              </span>
              <span className="text-xs font-normal text-white/90 mt-0.5 whitespace-nowrap">
                {effectiveCount} {effectiveCount === 1 ? "item" : "items"}
              </span>
            </button>

            {/* Circular Close Button (34px x 34px) */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close cart bar"
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                flexShrink: 0,
              }}
              className={cn(
                "flex items-center justify-center transition-opacity hover:opacity-80 cursor-pointer",
                "bg-gray-100 text-gray-500",
                "dark:bg-[#17181e] dark:text-gray-400",
              )}
            >
              <svg
                width="14"
                height="14"
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
