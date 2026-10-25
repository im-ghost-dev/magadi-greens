"use client";

import { useMemo } from "react";
import { CAT_RANK, type Product } from "@/lib/catalogue-client";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  products: Product[];
  search: string;
  activeCat: string;
  loading: boolean;
};

export function ProductGrid({ products, search, activeCat, loading }: Props) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => {
        if (activeCat !== "all" && p.cat !== activeCat) return false;
        if (q && !p.name.toLowerCase().includes(q) && !p.kn.includes(q)) return false;
        return true;
      })
      .sort(
        (a, b) =>
          CAT_RANK[a.cat] - CAT_RANK[b.cat] ||
          Number(b.stock) - Number(a.stock) ||
          a.name.localeCompare(b.name),
      );
  }, [products, search, activeCat]);

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-2xl border border-border bg-white p-3"
          >
            <Skeleton className="h-[110px] rounded-xl" />
            <Skeleton className="mt-3 h-3 w-1/2" />
            <Skeleton className="mt-1 h-4 w-3/4" />
            <Skeleton className="mt-3 h-9 w-full rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <p
        className="my-3 ml-0.5 text-[13px] text-mute"
        aria-live="polite"
      >
        {filtered.length
          ? `${filtered.length} item${filtered.length > 1 ? "s" : ""}`
          : ""}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {filtered.length ? (
          filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)
        ) : (
          <div className="col-span-full py-12 text-center text-mute">
            <b className="block text-[17px] text-ink">No items found</b>
            Try a different name or pick another category.
          </div>
        )}
      </div>
    </>
  );
}
