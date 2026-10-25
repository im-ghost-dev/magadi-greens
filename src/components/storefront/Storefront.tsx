"use client";

import { useEffect, useMemo, useState } from "react";
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

  const visible = cat === "All" ? searched : searched.filter((p) => p.category === cat);

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
      >
        {!query && <Hero settings={settings} />}
        {!query && <SpecialsCarousel specials={specials} />}

        <div
          className={cn(
            "sticky top-[106px] z-30 mt-4 border-b bg-background/85 backdrop-blur-md transition-[box-shadow,border-color] duration-300",
            scrolled ? "border-border/50 shadow-bar" : "border-transparent",
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

        <section id="menu" className="mx-auto max-w-6xl px-4 py-4" aria-label="Products">
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
              layout
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4"
            >
              <AnimatePresence mode="popLayout">
                {visible.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </AnimatePresence>
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
        subtitle="View Menu"
        subtitleHref="#menu"
      />
      <CartDrawer settings={settings} />
    </div>
  );
}
