"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Moon, Search, ShoppingBasket, Sun, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useCart } from "@/hooks/useCart";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/utils";

export function Header({
  shopName,
  query,
  onQuery,
  onOpenAdmin,
  isAdminAuthed,
}: {
  shopName: string;
  query: string;
  onQuery: (q: string) => void;
  onOpenAdmin: () => void;
  isAdminAuthed?: boolean;
}) {
  const { count, bounce, setOpen } = useCart();
  const scrolled = useScrolled();
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

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md transition-[box-shadow,border-color,background-color] duration-300",
        scrolled ? "border-border/60 shadow-bar" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        <div className="flex items-center cursor-pointer" onClick={() => onQuery("")}>
          <Logo name={shopName} compact />
        </div>
        <div className="flex items-center gap-1.5">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground hover:bg-secondary transition cursor-pointer"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-primary-deep" />
            )}
          </button>

          {/* Admin Button */}
          <button
            type="button"
            onClick={onOpenAdmin}
            aria-label="Admin"
            className="flex h-11 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-primary-deep transition hover:bg-secondary cursor-pointer"
          >
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isAdminAuthed ? "Admin panel" : "Admin"}
            </span>
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
      <div className="mx-auto max-w-6xl px-4 pb-2">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search tomatoes, spinach, mango…"
            aria-label="Search products"
            className="h-11 w-full rounded-full border border-input bg-card pl-10 pr-10 text-[15px] outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
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
    </header>
  );
}
