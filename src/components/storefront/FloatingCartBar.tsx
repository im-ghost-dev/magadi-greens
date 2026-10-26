"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export interface FloatingCartBarProps {
  /** Optional manual override for item count. If omitted, uses useCart().count */
  itemCount?: number;
  /** Primary title (defaults to "MAGADI GREENS") */
  title?: string;
  /** Subtitle link text (defaults to "View more veggies") */
  subtitle?: string;
  /** Subtitle target anchor / href (defaults to "#categories") */
  subtitleHref?: string;
  /** 48x48 Circular thumbnail image URL */
  thumbnail?: string;
  /** Handler when "View Cart" button is clicked. If omitted, opens CartDrawer via useCart() */
  onViewCart?: () => void;
  /** Optional handler when close is clicked */
  onDismiss?: () => void;
  /** Custom wrapper CSS classes */
  className?: string;
}

// Fresh vegetables and fruits basket image for MAGADI GREENS
const DEFAULT_THUMB =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80";

/**
 * Reusable floating bottom cart bar component fixed at bottom: 20px, z-index: 50.
 *
 * Displays fresh produce thumbnail, store branding, and "View more veggies ▸"
 * which smoothly scrolls the customer to the category chips / catalogue.
 * Clicking "×" empties the entire cart, reactively hiding the bar.
 */
export function FloatingCartBar({
  itemCount,
  title = "MAGADI GREENS",
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

  // If the cart item has its own valid image, show it; otherwise use the fresh veggies/fruits image
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
    // Clicking "×" completely empties the cart
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

  // Purely reactive visibility: visible whenever cart has items and drawer is closed
  const isVisible = effectiveCount > 0 && !cart.open;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="floatingCart"
          role="region"
          aria-label="Floating cart summary"
          // Only transform (y) + opacity are animated: both are GPU-composited, so no layout/paint jank.
          // Horizontal centering uses flex (NOT translateX), so framer-motion's transform never
          // fights a CSS transform - that conflict was the source of the jitter.
          initial={{ y: reduce ? 0 : 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: reduce ? 0 : 16, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: "max(20px, env(safe-area-inset-bottom))",
            zIndex: 50,
            display: "flex",
            justifyContent: "center",
            padding: "0 12px",
            pointerEvents: "none",
            willChange: "transform, opacity",
          }}
          className={cn("select-none", className)}
        >
          <div style={{ width: "100%", maxWidth: "420px", pointerEvents: "auto" }}>
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
              "w-full",
              "bg-white dark:bg-[#23252d]",
              "border border-black/10 dark:border-white/10",
              "shadow-[0_12px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)]",
            )}
          >
            {/* Left 48px x 48px Circular Thumbnail */}
            <img
              src={activeThumbnail}
              alt="Fresh Vegetables and Fruits"
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

            {/* Middle Text Stack with tuned font sizes (14.5px / 12.5px) */}
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
                  fontSize: "14.5px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
                className="block text-gray-900 dark:text-white"
              >
                {title}
              </span>
              <a
                href={subtitleHref}
                onClick={handleScrollToCategories}
                style={{
                  fontSize: "12.5px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontWeight: 500,
                  marginTop: "2px",
                }}
                className="inline-flex items-center gap-1 text-gray-600 transition-opacity hover:opacity-80 dark:text-gray-300 cursor-pointer"
              >
                <span style={{ whiteSpace: "nowrap" }}>{subtitle}</span>
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

            {/* Circular Close ("×") Button (34px x 34px) */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Empty cart and close cart bar"
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
