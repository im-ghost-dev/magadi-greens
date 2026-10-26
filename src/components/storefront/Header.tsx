"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Phone, Search, ShoppingBasket, Sun, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCart } from "@/hooks/useCart";
import { useScrolled } from "@/hooks/useScrolled";
import { telHref } from "@/lib/settings";
import { cn } from "@/lib/utils";

interface HeaderProps {
  shopName: string;
  bannerText?: string | null;
  phone?: string | null;
  query: string;
  onQuery: (q: string) => void;
  onOpenAdmin: () => void;
  chips?: React.ReactNode;
  children?: React.ReactNode;
}

export function Header({
  shopName,
  bannerText,
  phone,
  query,
  onQuery,
  onOpenAdmin,
  chips,
  children,
}: HeaderProps) {
  const { count, bounce, setOpen: setCartOpen } = useCart();
  const [isDark, setIsDark] = useState(false);
  const isScrolled = useScrolled(20);
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

  // 2. Secret 5-tap gesture detection on store logo to open admin
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

  return (
    <div className="w-full" id="cs">
      {/* ========================================================== */}
      {/* 0. TOP ANNOUNCEMENT BANNER (Full width, dark green, white text) */}
      {/* ========================================================== */}
      {bannerText?.trim() && (
        <div className="w-full bg-[#0d2e1b] dark:bg-[#091f12] text-white py-2 px-4 border-b border-white/10">
          <div className="mx-auto max-w-6xl flex flex-col items-center justify-center text-center text-xs sm:text-sm gap-0.5">
            <p className="font-medium tracking-tight">{bannerText.trim()}</p>
            {phone && (
              <a
                href={telHref(phone)}
                className="inline-flex items-center gap-1.5 text-xs text-white/90 hover:text-white underline underline-offset-2 transition py-0.5"
              >
                <Phone className="h-3 w-3 shrink-0" aria-hidden />
                <span>
                  Call the store: <strong className="font-semibold">{phone}</strong>
                </span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 1. BRAND ROW (Fixed height 64px, scrolls away naturally)    */}
      {/* ========================================================== */}
      <header className="brand mx-auto max-w-6xl px-4 flex h-16 items-center justify-between">
        {/* Logo / Brand Name with secret 5-tap gesture */}
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

        {/* Right Action Icons: Theme Toggle & Cart */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-card text-foreground shadow-xs hover:scale-105 active:scale-95 transition cursor-pointer"
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
            onClick={() => setCartOpen(true)}
            aria-label={`Open pick-up list, ${count} items`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elev-md hover:scale-105 transition cursor-pointer"
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
      </header>

      {/* ========================================================== */}
      {/* 2. STICKY SEARCH & CHIPS DOCK (Pinned to top on scroll)    */}
      {/* ========================================================== */}
      <div className={cn("search-dock", isScrolled && "is-scrolled")}>
        <div className="search-dock-inner mx-auto max-w-6xl px-4">
          <label className="search-field" htmlFor="q">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
            <input
              id="q"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search tomatoes, spinach, mango…"
              aria-label="Search products"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  onQuery("");
                  inputRef.current?.focus({ preventScroll: true });
                }}
                aria-label="Clear search"
                className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <div className="search-chips" role="tablist">
            {chips ?? children}
          </div>
        </div>
      </div>

      {/* Main page content rendered inside wrapper so search-dock stays sticky for the full scroll height */}
      {chips ? children : null}
    </div>
  );
}
