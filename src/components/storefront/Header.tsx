"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Search, ShoppingBasket, Sun, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCart } from "@/hooks/useCart";

export function Header({
  shopName,
  query,
  onQuery,
  onOpenAdmin,
  children,
}: {
  shopName: string;
  query: string;
  onQuery: (q: string) => void;
  onOpenAdmin: () => void;
  children?: React.ReactNode;
}) {
  const { count, bounce, setOpen } = useCart();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem("mg_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = saved ? saved === "dark" : prefersDark;
      setIsDark(dark);
      if (dark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("mg_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("mg_theme", "light");
    }
  }

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoTap = () => {
    // Normal single-tap functionality: clear search query
    onQuery("");

    // Secret 5-tap gesture detection for store owner
    tapCountRef.current += 1;

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
    }

    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      onOpenAdmin();
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 1500);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 w-full transition-colors duration-200"
      style={{
        background: isDark ? "rgba(15, 21, 18, 0.88)" : "rgba(248, 250, 252, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: isDark
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* Top Header Row */}
      <div
        className="mx-auto max-w-6xl"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
        }}
      >
        {/* Store logo with hidden 5-tap admin gesture */}
        <div
          className="flex items-center cursor-pointer select-none"
          onClick={handleLogoTap}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onQuery("");
            }
          }}
          aria-label={shopName}
        >
          <Logo name={shopName} compact />
        </div>

        {/* Right Icons Container with solid circular backgrounds */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          {/* Light / Dark Mode Toggle with solid circular background */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-white dark:bg-[#18221d] text-foreground shadow-xs hover:bg-secondary/60 transition cursor-pointer"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-primary-deep" />
            )}
          </button>

          {/* Cart Badge Button */}
          <motion.button
            type="button"
            key={`cart-${bounce}`}
            animate={bounce ? { scale: [1, 1.18, 0.94, 1] } : {}}
            transition={{ duration: 0.45 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setOpen(true)}
            aria-label={`Open pick-up list, ${count} items`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elev-md cursor-pointer"
          >
            <ShoppingBasket className="h-5 w-5" id="cart-badge-target" />
            {count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4, y: 6, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 600, damping: 14 }}
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-sale px-1 text-[11px] font-bold text-sale-foreground ring-2 ring-background"
              >
                {count}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="mx-auto max-w-6xl px-4 pb-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search tomatoes, spinach, mango…"
            aria-label="Search products"
            className="h-11 w-full rounded-full border border-input/60 bg-white/90 dark:bg-[#18221d]/90 backdrop-blur-sm pl-10 pr-10 text-[15px] outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      {/* Unified Category Filter Bar */}
      {children && (
        <div className="mx-auto max-w-6xl px-4 pb-2">
          {children}
        </div>
      )}
    </header>
  );
}
