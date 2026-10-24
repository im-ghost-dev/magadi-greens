"use client";

import { useEffect, useState } from "react";
import { useProducts } from "@/lib/use-products";
import { useCart } from "@/store/useCart";
import { useAdmin } from "@/store/useAdmin";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { CategoryBar } from "./CategoryBar";
import { ProductGrid } from "./ProductGrid";
import { CartDrawer } from "./CartDrawer";
import { StoreInfo } from "./StoreInfo";
import { AdminApp } from "@/components/admin/AdminApp";

/** The whole storefront – header, hero, category bar, product grid, store info, cart drawer. */
export function Storefront() {
  const { products, loading, refetch } = useProducts();
  const cart = useCart((s) => s.cart);
  const sanitize = useCart((s) => s.sanitize);
  const adminStatus = useAdmin((s) => s.status);
  const setAuthed = useAdmin((s) => s.setAuthed);
  const setStatus = useAdmin((s) => s.setStatus);

  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState<"store" | "admin">("store");

  // Measure the sticky header's real height (it changes between mobile = 2 rows
  // and desktop = 1 row) and publish it as --header-h so the sticky category bar
  // can sit flush underneath it on every screen size. Also re-measure on resize
  // so the layout never drifts.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const hdr = document.getElementById("mg-header");
    if (!hdr) return;
    const apply = () => {
      const h = hdr.offsetHeight;
      document.documentElement.style.setProperty("--header-h", `${h}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(hdr);
    window.addEventListener("resize", apply, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, [view]);

  // Re-sanitize the cart whenever the catalogue changes (drops gone/sold-out items,
  // snaps quantities to valid steps).
  const catalogueKey = products.map((p) => `${p.id}:${p.stock}:${p.unit}`).join("|");
  useEffect(() => {
    if (!products.length) return;
    const valid = new Map(
      products.map((p) => [
        p.id,
        {
          stock: p.stock,
          step: p.unit === "kg" ? 0.25 : 1,
          max: p.unit === "kg" ? 25 : 50,
        },
      ]),
    );
    sanitize(valid);
  }, [catalogueKey, products, sanitize]);

  // On mount, ask the server whether the admin cookie is still valid.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/login", { cache: "no-store" });
        const data = await r.json();
        if (!cancelled) setAuthed(!!data.ok);
      } catch {
        if (!cancelled) setStatus("guest");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setAuthed, setStatus]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        cartCount={Object.keys(cart).length}
        onOpenCart={() => setCartOpen(true)}
        search={search}
        onSearch={setSearch}
        view={view}
        onSwitchView={setView}
        adminStatus={adminStatus}
      />

      {view === "admin" ? (
        <main className="flex-1">
          <AdminApp onExit={() => setView("store")} onSaved={refetch} />
        </main>
      ) : (
        <main className="flex-1">
          <div className="mx-auto w-full max-w-[1180px] px-4">
            <Hero />
            <CategoryBar active={activeCat} onSelect={setActiveCat} />
            <ProductGrid
              products={products}
              search={search}
              activeCat={activeCat}
              loading={loading}
            />
            <StoreInfo />
          </div>
        </main>
      )}

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        products={products}
        onSavedOrder={() => refetch()}
      />

      <footer className="mt-auto border-t border-border bg-white py-5 text-center text-xs text-mute">
        © MAGADI GREENS · Ittamadu, Bengaluru · Self pick-up only
      </footer>
    </div>
  );
}
