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

  const activeSpecialCleanupRef = useRef<(() => void) | null>(null);

  function handleSelectSpecial(special: Special) {
    if (!products || products.length === 0) return;

    // Cancel any ongoing special highlight/timers
    if (activeSpecialCleanupRef.current) {
      activeSpecialCleanupRef.current();
      activeSpecialCleanupRef.current = null;
    }

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

    const targetId = target.id;

    // 2. Auto-reset filters if item is hidden
    let resetNeeded = false;
    if (query) {
      setQuery("");
      resetNeeded = true;
    }
    if (inStockOnly && !target.inStock) {
      setInStockOnly(false);
      resetNeeded = true;
    }
    if (cat !== "All" && target.category !== cat) {
      setCat("All");
      resetNeeded = true;
    }

    // 3. Smooth scroll and 2x glow highlight
    function executeScrollAndGlow(attempt = 0) {
      const el = document.getElementById(`product-card-${targetId}`);
      if (!el) {
        if (attempt < 10) {
          setTimeout(() => executeScrollAndGlow(attempt + 1), 30);
        }
        return;
      }

      // 1. Force target card visibility before scrolling begins
      // Ensures off-screen card using content-visibility: auto is rendered & painted immediately
      el.style.contentVisibility = "visible";

      // 2. Smooth scroll the element into center of viewport
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // 3. Trigger 2x glow ONLY after card enters viewport
      let hasTriggered = false;
      let observer: IntersectionObserver | null = null;
      let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
      let resetTimer: ReturnType<typeof setTimeout> | null = null;

      const onScrollEnd = () => {
        triggerGlow();
      };

      const cleanup = () => {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        if (resetTimer) {
          clearTimeout(resetTimer);
          resetTimer = null;
        }
        window.removeEventListener("scrollend", onScrollEnd);
        el.classList.remove("special-glow-highlight");
        el.style.contentVisibility = "";
      };

      activeSpecialCleanupRef.current = cleanup;

      const triggerGlow = () => {
        if (hasTriggered) return;
        hasTriggered = true;

        if (observer) {
          observer.disconnect();
          observer = null;
        }
        if (fallbackTimer) {
          clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
        window.removeEventListener("scrollend", onScrollEnd);

        // 4. DOM-level animation trigger (bypasses React.memo & rerenders)
        el.classList.remove("special-glow-highlight");
        void el.offsetWidth; // Force synchronous browser reflow
        el.classList.add("special-glow-highlight");
        setHighlightedId(targetId);

        // Reset after 2 cycles of 500ms = 1000ms (+ 50ms buffer)
        resetTimer = setTimeout(() => {
          cleanup();
          setHighlightedId((curr) => (curr === targetId ? null : curr));
          if (activeSpecialCleanupRef.current === cleanup) {
            activeSpecialCleanupRef.current = null;
          }
        }, 1050);
      };

      window.addEventListener("scrollend", onScrollEnd, { once: true });

      // Check if element is already within the central viewport region
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const isAlreadyVisible = rect.top >= 0 && rect.bottom <= vh;

      if (isAlreadyVisible) {
        setTimeout(triggerGlow, 80);
      } else {
        if (typeof IntersectionObserver !== "undefined") {
          observer = new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                  triggerGlow();
                  break;
                }
              }
            },
            {
              threshold: [0.5, 0.6],
            },
          );
          observer.observe(el);
        }

        // Fallback timer ensures glow starts even if scrollend or observer threshold is missed
        fallbackTimer = setTimeout(() => {
          triggerGlow();
        }, 500);
      }
    }

    if (resetNeeded) {
      setTimeout(() => executeScrollAndGlow(0), 40);
    } else {
      requestAnimationFrame(() => executeScrollAndGlow(0));
    }
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
    <div className="min-h-screen">
      <Header
        shopName={settings?.shopName ?? "MAGADI GREENS"}
        query={query}
        onQuery={setQuery}
        onOpenAdmin={() => setView("admin")}
        isAdminAuthed={adminAuthed}
      />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-transparent"
      >
        {!query && <Hero settings={settings} />}
        {!query && (
          <SpecialsCarousel
            specials={specials}
            onSelectSpecial={handleSelectSpecial}
          />
        )}

        <div
          id="categories"
          className={cn(
            "sticky top-[106px] z-30 mt-4 border-b transition-[box-shadow,border-color,background-color] duration-300",
            scrolled
              ? "border-border/40 bg-background/60 backdrop-blur-md shadow-bar"
              : "border-transparent bg-transparent",
          )}
        >
          <CategoryChips
            className="mx-auto max-w-6xl px-4"
            options={[...FILTERS]}
            value={cat}
            onChange={setCat}
            counts={counts}
            inStockOnly={inStockOnly}
            onInStock={setInStockOnly}
          />
        </div>

        <section id="menu" className="mx-auto max-w-6xl px-4 py-4 pb-28 bg-transparent" aria-label="Products">
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
            <p>© {settings?.shopName ?? "MAGADI GREENS"}</p>
            <button
              type="button"
              onClick={() => setView("admin")}
              className="font-medium text-primary hover:underline cursor-pointer"
            >
              Shopkeeper Admin Login
            </button>
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
