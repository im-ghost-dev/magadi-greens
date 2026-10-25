"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Search, ShoppingBasket, Sun, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

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
  const [isPinned, setIsPinned] = useState(false);

  // 1. Theme sync with localStorage & classList
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

  // 2. Secret 5-tap gesture detection on store logo
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoTap = () => {
    onQuery("");
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      onOpenAdmin();
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 1500);
    }
  };

  // 3. Scroll Hysteresis Listener: collapse brand bar on scroll down (> 75), expand back on scroll up (< 20)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || window.pageYOffset || 0;
          setIsPinned((prev) => (y > 75 ? true : y < 20 ? false : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 w-full transition-colors duration-300"
      style={{
        background: isDark ? "rgba(15, 21, 18, 0.92)" : "rgba(248, 250, 252, 0.92)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: isDark
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid rgba(0, 0, 0, 0.06)",
      }}
    >
      <div
        className="mx-auto max-w-6xl transition-all duration-300"
        style={{
          padding: isPinned ? "8px 16px" : "12px 16px 8px 16px",
        }}
      >
        {/* ========================================================== */}
        {/* ROW 1: BRAND BAR (Collapses smoothly when scrolled down)    */}
        {/* ========================================================== */}
        <div
          className={cn(
            "flex items-center justify-between transition-all duration-300 overflow-hidden",
            isPinned
              ? "max-h-0 opacity-0 mb-0 -translate-y-2 pointer-events-none"
              : "max-h-14 opacity-100 mb-2.5 translate-y-0",
          )}
        >
          {/* Logo / Brand with hidden 5-tap gesture */}
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={handleLogoTap}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onQuery("");
            }}
            aria-label={shopName}
          >
            <Logo name={shopName} compact />
          </div>

          {/* Right Action Icons (Theme Toggle & Cart) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/80 bg-white dark:bg-[#18221d] text-foreground shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-primary-deep" />
              )}
            </button>

            {/* Cart Button */}
            <motion.button
              type="button"
              key={`cart-${bounce}`}
              animate={bounce ? { scale: [1, 1.18, 0.94, 1] } : {}}
              transition={{ duration: 0.45 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setOpen(true)}
              aria-label={`Open pick-up list, ${count} items`}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elev-md hover:scale-105 transition cursor-pointer"
            >
              <ShoppingBasket className="h-4 w-4" id="cart-badge-target" />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, y: 6, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 14 }}
                  className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sale px-1 text-[10px] font-bold text-sale-foreground ring-1 ring-background"
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>

        {/* ========================================================== */}
        {/* ROW 2 & 3: FULL SEARCH BAR & CATEGORY PILLS (PINNED)       */}
        {/* ========================================================== */}
        <div className="flex flex-col gap-2 pb-1">
          {/* Full-Width Search Input Pill */}
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search tomatoes, spinach, mango…"
              aria-label="Search products"
              className="h-10 w-full rounded-full border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#18221d]/95 pl-10 pr-9 text-xs md:text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-xs"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal Category Pills */}
          {children}
        </div>
      </div>
    </header>
  );
}
