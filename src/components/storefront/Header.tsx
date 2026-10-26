"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Phone, Search, ShoppingBasket, Sun, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCart } from "@/hooks/useCart";
import { telHref } from "@/lib/settings";

interface HeaderProps {
  shopName: string;
  bannerText?: string | null;
  phone?: string | null;
  query: string;
  onQuery: (q: string) => void;
  onOpenAdmin: () => void;
  children?: React.ReactNode;
}

export function Header({
  shopName,
  bannerText,
  phone,
  query,
  onQuery,
  onOpenAdmin,
  children,
}: HeaderProps) {
  const { count, bounce, setOpen: setCartOpen } = useCart();
  const [isDark, setIsDark] = useState(false);

  // DOM Refs
  const rootRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLLabelElement>(null);
  const dockRef = useRef<HTMLElement>(null);
  const idleRef = useRef<HTMLDivElement>(null);
  const overRef = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const q1Ref = useRef<HTMLInputElement>(null);
  const q2Ref = useRef<HTMLInputElement>(null);

  const isOpenRef = useRef(false);
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // 3. Open / close dock search overlay
  function setDockOpen(open: boolean, focus = true) {
    if (isOpenRef.current === open) return;
    isOpenRef.current = open;

    const dock = dockRef.current;
    const over = overRef.current;
    const idle = idleRef.current;
    const openBtn = openBtnRef.current;
    const root = rootRef.current;
    const q2 = q2Ref.current;

    if (dock) dock.dataset.open = String(open);
    if (over) (over as HTMLElement & { inert: boolean }).inert = !open;
    if (idle) (idle as HTMLElement & { inert: boolean }).inert = open;
    if (openBtn && root) {
      const iVal = parseFloat(getComputedStyle(root).getPropertyValue("--i") || "0");
      (openBtn as HTMLElement & { inert: boolean }).inert = open || iVal < 0.7;
    }

    if (focusTimerRef.current) clearTimeout(focusTimerRef.current);

    if (open) {
      if (focus && q2) {
        focusTimerRef.current = setTimeout(() => {
          q2.focus({ preventScroll: true });
        }, 230);
      }
    } else {
      if (q2) q2.blur();
      if (focus && openBtn) {
        openBtn.focus({ preventScroll: true });
      }
    }
  }

  // Handle Cancel / Escape
  function handleCancel() {
    onQuery("");
    setDockOpen(false);
  }

  // 4. Scroll Scrubbed Animation Listener
  useEffect(() => {
    const root = rootRef.current;
    const brand = brandRef.current;
    const row = rowRef.current;
    const dock = dockRef.current;
    const idle = idleRef.current;
    const over = overRef.current;
    const field = fieldRef.current;
    const openBtn = openBtnRef.current;
    const q2 = q2Ref.current;

    if (!root || !brand || !row || !dock || !idle || !over || !field || !openBtn) return;

    let stickAt = 0;
    let range = 1;
    let ticking = false;

    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    // Measure fixed heights (never changes while scrolling)
    function measure() {
      if (!brand || !row) return;
      const bannerH = bannerRef.current ? bannerRef.current.offsetHeight : 0;
      stickAt = bannerH + brand.offsetHeight + row.offsetHeight; // scrollY at which chip row hits top
      range = Math.max(1, stickAt - 16); // finish morph slightly before that
    }

    function update() {
      ticking = false;
      const y = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const f = ease(clamp(y / (range * 0.7))); // field shrinks toward left
      const i = ease(clamp((y - range * 0.4) / (range * 0.6))); // magnifier appears in dock
      const s = clamp((y - (stickAt - 10)) / 10); // frosted background once stuck

      root?.style.setProperty("--f", f.toFixed(3));
      root?.style.setProperty("--i", i.toFixed(3));
      root?.style.setProperty("--s", s.toFixed(3));

      row?.classList.toggle("is-gone", f > 0.85);
      if (field) (field as HTMLElement & { inert: boolean }).inert = f > 0.85;
      if (openBtn) {
        (openBtn as HTMLElement & { inert: boolean }).inert = i < 0.7 || isOpenRef.current;
      }

      // Back at the top with nothing typed: put the overlay away
      if (isOpenRef.current && y < 8 && !q2?.value) {
        setDockOpen(false, false);
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    function handleResize() {
      measure();
      update();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        measure();
        update();
      });
    }

    (over as HTMLElement & { inert: boolean }).inert = true;
    measure();
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", handleResize);
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current);
    };
  }, []);

  // 5. Escape key to close dock search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpenRef.current) {
        handleCancel();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="cs w-full" id="cs" ref={rootRef}>
      {/* ========================================================== */}
      {/* 0. TOP ANNOUNCEMENT BANNER (Full width, dark green, white text) */}
      {/* ========================================================== */}
      {bannerText?.trim() && (
        <div
          ref={bannerRef}
          className="w-full bg-[#0d2e1b] dark:bg-[#091f12] text-white py-2 px-4 border-b border-white/10"
        >
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
      <header
        className="brand mx-auto max-w-6xl px-4 flex h-16 items-center justify-between"
        ref={brandRef}
      >
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
      {/* 2. SEARCH ROW (Fixed height 56px, scrolls away naturally)   */}
      {/* ========================================================== */}
      <div className="cs-row mx-auto max-w-6xl px-4" id="csRow" ref={rowRef}>
        <label className="cs-field" id="csField" ref={fieldRef}>
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            id="q1"
            ref={q1Ref}
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
              onClick={() => onQuery("")}
              aria-label="Clear search"
              className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      {/* ========================================================== */}
      {/* 3. PINNED DOCK (Category Chips + Morphing Search Overlay)  */}
      {/* ========================================================== */}
      <nav
        className="cs-dock"
        id="csDock"
        ref={dockRef}
        data-open="false"
        aria-label="Categories"
      >
        <div className="cs-dock-inner">
          {/* Idle State: Magnifier slot + Horizontal Category Chips */}
          <div className="cs-idle" id="csIdle" ref={idleRef}>
            <div className="cs-slot">
              <button
                type="button"
                className="cs-icon"
                id="csOpen"
                ref={openBtnRef}
                onClick={() => setDockOpen(true)}
                aria-label="Open search"
                tabIndex={0}
              >
                <Search className="h-5 w-5 text-muted-foreground" aria-hidden />
              </button>
            </div>
            <div className="cs-chips" role="tablist">
              {children}
            </div>
          </div>

          {/* Active Overlay State: Expanded Search Field + Cancel Button */}
          <div className="cs-over" id="csOver" ref={overRef}>
            <label className="cs-ofield">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                id="q2"
                ref={q2Ref}
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
                  onClick={() => onQuery("")}
                  aria-label="Clear search"
                  className="mr-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <button
              type="button"
              className="cs-cancel"
              id="csCancel"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
