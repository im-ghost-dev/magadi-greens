"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { SpecialsCarousel } from "./SpecialsCarousel";
import { CategoryChips } from "./CategoryChips";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { CartDrawer } from "./CartDrawer";
import { FloatingCartBar } from "./FloatingCartBar";
import { ContactSection } from "./ContactSection";
import { AdminApp } from "@/components/admin/AdminApp";
import { getProducts, getSettings, getSpecials, isAdmin } from "@/lib/api";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/utils";
import { CATEGORIES, type Product, type ShopSettings, type Special } from "@/types";

const FILTERS = ["All", ...CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];

export function Storefront() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [specials, setSpecials] = useState<Special[]>([]);
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Filter>("All");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [view, setView] = useState<"store" | "admin">("store");
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const scrolled = useScrolled(360);

  function loadData() {
    getProducts().then(setProducts).catch(console.error);
    getSpecials().then(setSpecials).catch(console.error);
    getSettings().then(setSettings).catch(console.error);
    isAdmin().then(setAdminAuthed).catch(() => setAdminAuthed(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  // URL Trigger: Open admin if ?admin=true, ?admin=1, or #admin is present
  useEffect(() => {
    const checkUrlForAdmin = () => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      const hasAdminQuery = params.get("admin") === "true" || params.get("admin") === "1";
      const hasAdminHash = window.location.hash.toLowerCase() === "#admin";

      if (hasAdminQuery || hasAdminHash) {
        setView("admin");
      }
    };

    checkUrlForAdmin();
    window.addEventListener("hashchange", checkUrlForAdmin);
    window.addEventListener("popstate", checkUrlForAdmin);
    return () => {
      window.removeEventListener("hashchange", checkUrlForAdmin);
      window.removeEventListener("popstate", checkUrlForAdmin);
    };
  }, []);

  // Desktop Keyboard Shortcut: Ctrl + Shift + A (or Cmd + Shift + A) to toggle Admin
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setView((curr) => (curr === "admin" ? "store" : "admin"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelectSpecial(special: Special) {
    if (!products || products.length === 0) return;

    // 1. Match product by productId or normalized words
    let target = special.productId
      ? products.find((p) => String(p.id) === String(special.productId))
      : null;

    if (!target) {
      const sWords = special.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .map((w) => (w.endsWith("es") ? w.slice(0, -2) : w.endsWith("s") ? w.slice(0, -1) : w));

      let bestProduct: Product | null = null;
      let maxScore = 0;
      for (const p of products) {
        const pWords = p.name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length > 2)
          .map((w) => (w.endsWith("es") ? w.slice(0, -2) : w.endsWith("s") ? w.slice(0, -1) : w));

        let score = 0;
        for (const sw of sWords) {
          if (pWords.some((pw) => pw === sw || pw.includes(sw) || sw.includes(pw))) {
            score++;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          bestProduct = p;
        }
      }
      target = bestProduct;
    }

    if (!target) return;

    const targetProductId = target.id;

    // 1. Ensure 'All' category is active and search is cleared so the card is in the DOM
    if (cat !== "All") setCat("All");
    if (query) setQuery("");
    if (inStockOnly && !target.inStock) setInStockOnly(false);

    // 2. Wait one frame for DOM to ensure target card exists
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(`product-card-${targetProductId}`);
        if (!el) return;

        // Scroll target card to the center of the screen
        el.scrollIntoView({ behavior: "smooth", block: "center" });

        // 3. Poll with requestAnimationFrame until scroll stops AND card is in viewport
        let lastScrollY = window.scrollY;
        let stableFrames = 0;
        let totalFrames = 0;

        const waitForScrollEnd = () => {
          totalFrames++;
          const currentScrollY = window.scrollY;
          const rect = el.getBoundingClientRect();
          const isVisibleInCenter =
            rect.top >= 60 && rect.bottom <= window.innerHeight - 40;

          if (Math.abs(currentScrollY - lastScrollY) < 1.5 && isVisibleInCenter) {
            stableFrames++;
          } else {
            stableFrames = 0;
          }
          lastScrollY = currentScrollY;

          // Once scroll has settled on the card (or max ~1.2s safety cap)
          if (stableFrames >= 6 || totalFrames > 75) {
            // Ensure it is centered in case layout shifted during first scroll
            if (!isVisibleInCenter) {
              el.scrollIntoView({ behavior: "instant", block: "center" });
            }

            // 4. Play 2x 500ms glow directly via Web Animations API (immune to React re-renders)
            const isDark = document.documentElement.classList.contains("dark");
            el.animate(
              [
                {
                  boxShadow: "0 0 0 0px rgba(24, 92, 55, 0)",
                  transform: "scale(1)",
                },
                {
                  boxShadow: isDark
                    ? "0 0 0 4px #4ade80, 0 0 32px rgba(74, 222, 128, 0.95)"
                    : "0 0 0 4px #185c37, 0 0 32px rgba(34, 197, 94, 0.95)",
                  transform: "scale(1.03)",
                },
                {
                  boxShadow: "0 0 0 0px rgba(24, 92, 55, 0)",
                  transform: "scale(1)",
                },
              ],
              {
                duration: 500,
                iterations: 2,
                easing: "ease-in-out",
              },
            );
            return;
          }

          requestAnimationFrame(waitForScrollEnd);
        };

        requestAnimationFrame(waitForScrollEnd);
      }, 60);
    });
  }

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (products ?? []).filter(
      (p) =>
        (!q || p.name.toLowerCase().includes(q) || p.plu.includes(q)) &&
        (!inStockOnly || p.inStock),
    );
  }, [products, query, inStockOnly]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: searched.length };
    for (const p of searched) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [searched]);

  const visible = useMemo(
    () => (cat === "All" ? searched : searched.filter((p) => p.category === cat)),
    [cat, searched],
  );

  if (view === "admin") {
    return (
      <AdminApp
        onExit={() => {
          setView("store");
          loadData();
        }}
        onSaved={loadData}
      />
    );
  }

  return (
    <div className="relative z-[1] min-h-[150vh]" style={{ background: "transparent" }}>
      <Header
        shopName={settings?.shopName ?? "MAGADI GREENS"}
        query={query}
        onQuery={setQuery}
        onOpenAdmin={() => setView("admin")}
      >
        <CategoryChips
          options={[...FILTERS]}
          value={cat}
          onChange={setCat}
          counts={counts}
          inStockOnly={inStockOnly}
          onInStock={setInStockOnly}
        />
      </Header>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-[1]"
        style={{ background: "transparent" }}
      >
        {!query && <Hero settings={settings} />}
        {!query && (
          <SpecialsCarousel
            specials={specials}
            onSelectSpecial={handleSelectSpecial}
          />
        )}

        <section
          id="menu"
          className="relative z-[1] mx-auto max-w-6xl px-4 mt-3 pb-28"
          style={{ background: "transparent" }}
          aria-label="Products"
        >
          {products === null ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <SearchX className="h-7 w-7 text-primary" />
              </div>
              <p className="mt-4 font-semibold text-lg">Nothing matches “{query || cat}”</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another name or clear the filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCat("All");
                  setInStockOnly(false);
                }}
                className="mt-4 h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <motion.div
              key={cat + (inStockOnly ? "-stock" : "") + (query ? "-q" : "")}
              initial={{ opacity: 0, transform: "translate3d(0, 6px, 0)" }}
              animate={{ opacity: 1, transform: "translate3d(0, 0, 0)" }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4 will-change-[transform,opacity]"
            >
              {visible.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  isHighlighted={highlightedId === p.id}
                  onHighlightEnd={() =>
                    setHighlightedId((curr) => (curr === p.id ? null : curr))
                  }
                />
              ))}
            </motion.div>
          )}
        </section>

        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6">
          {settings && <ContactSection settings={settings} />}
          <div className="mt-6 flex flex-col items-center gap-1.5 text-center text-xs text-muted-foreground">
            <p className="flex items-center gap-1 select-none">
              <span>© {settings?.shopName ?? "MAGADI GREENS"}</span>
              {/* Discrete footer trigger: double-click subtle dot to open admin */}
              <span
                onDoubleClick={() => setView("admin")}
                title=""
                className="inline-block px-1 opacity-25 hover:opacity-60 transition-opacity cursor-default select-none"
                aria-hidden="true"
              >
                •
              </span>
            </p>
          </div>
        </footer>
      </motion.main>

      <FloatingCartBar
        title={settings?.shopName ?? "MAGADI GREENS"}
        subtitle="View more veggies"
        subtitleHref="#categories"
      />
      <CartDrawer products={products} settings={settings} />
    </div>
  );
}
