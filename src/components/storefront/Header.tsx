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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // 3. Scroll Hysteresis Listener (prevents jitter at threshold)
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY || window.pageYOffset || 0;
          // Collapse at > 55px, Expand back at < 15px (unless search is explicitly opened)
          if (!isSearchExpanded) {
            setIsScrolled((prev) => (y > 55 ? true : y < 15 ? false : prev));
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSearchExpanded]);

  // Determine if header is in compact sticky mode
  const isCompact = isScrolled && !isSearchExpanded && !query;

  // Handle clicking the morphed search icon when scrolled down
  const handleSearchIconClick = () => {
    setIsSearchExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 60);
  };

  // Handle closing / canceling expanded search
  const handleCancelSearch = () => {
    setIsSearchExpanded(false);
    onQuery("");
  };

  return (
    <header
      className="sticky top-0 z-40 w-full transition-all duration-360 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        background: isDark ? "rgba(15, 21, 18, 0.85)" : "rgba(248, 250, 252, 0.85)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: isDark
          ? "1px solid rgba(255, 255, 255, 0.08)"
          : "1px solid rgba(0, 0, 0, 0.06)",
        transition: "all 360ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div
        className="mx-auto max-w-6xl transition-all duration-360 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          padding: isCompact ? "8px 16px" : "12px 16px 8px 16px",
          transition: "padding 360ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* ========================================================== */}
        {/* ROW 1: BRAND BAR (Collapses smoothly when scrolled down)    */}
        {/* ========================================================== */}
        <div
          style={{
            transition: "all 360ms cubic-bezier(0.22, 1, 0.36, 1)",
            maxHeight: isCompact ? "0px" : "56px",
            opacity: isCompact ? 0 : 1,
            transform: isCompact ? "translateY(-12px)" : "translateY(0px)",
            marginBottom: isCompact ? "0px" : "10px",
            pointerEvents: isCompact ? "none" : "auto",
          }}
          className="flex items-center justify-between overflow-hidden"
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
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border/80 bg-white dark:bg-[#18221d] text-foreground shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-primary-deep" />
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
              className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elev-md hover:scale-105 transition cursor-pointer"
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

        {/* ========================================================== */}
        {/* ROW 2 & 3: MORPHING SEARCH BAR & FLOATING CATEGORY ROW     */}
        {/* ========================================================== */}
        <div
          className="flex flex-wrap items-center gap-2.5 w-full"
          style={{
            transition: "all 360ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {/* Search Container (Morphs between full pill and 42px circular icon) */}
          <div
            style={{
              transition: "all 360ms cubic-bezier(0.22, 1, 0.36, 1)",
              flex: isCompact ? "0 0 42px" : "1 1 100%",
              maxWidth: isCompact ? "42px" : "100%",
            }}
            className="h-[42px] shrink-0"
          >
            {isCompact ? (
              // Collapsed Circular Search Button (42px x 42px)
              <button
                type="button"
                onClick={handleSearchIconClick}
                aria-label="Open Search"
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#18221d] text-foreground shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            ) : (
              // Full-Width Search Input Bar with Cancel button
              <div className="relative flex h-[42px] w-full items-center">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => onQuery(e.target.value)}
                  placeholder="Search tomatoes, spinach, mango…"
                  aria-label="Search products"
                  className="h-[42px] w-full rounded-full border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#18221d] pl-10 pr-16 text-[14px] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-xs"
                />
                {(query || isSearchExpanded) && (
                  <button
                    type="button"
                    onClick={handleCancelSearch}
                    aria-label="Cancel search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition cursor-pointer"
                  >
                    {isSearchExpanded ? "Cancel" : <X className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Floating Category Pills (Slides beside search icon when compact, or wraps below when expanded) */}
          {children && (
            <div
              style={{
                transition: "all 360ms cubic-bezier(0.22, 1, 0.36, 1)",
                flex: isCompact
                  ? isSearchExpanded
                    ? "0 0 0px"
                    : "1 1 0%"
                  : "1 1 100%",
                minWidth: 0,
                opacity: isCompact && isSearchExpanded ? 0 : 1,
                transform: isCompact && isSearchExpanded ? "translateX(20px)" : "translateX(0px)",
                pointerEvents: isCompact && isSearchExpanded ? "none" : "auto",
                overflow: isCompact && isSearchExpanded ? "hidden" : "visible",
              }}
              className="w-full"
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
