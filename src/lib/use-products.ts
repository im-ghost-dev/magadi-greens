"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { Product } from "./catalogue-client";

type Catalogue = { version: string; items: Product[] };

async function fetchProducts(): Promise<Catalogue> {
  const r = await fetch("/api/products", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load products");
  return r.json();
}

async function fetchVersion(): Promise<{ version: string }> {
  const r = await fetch("/api/products/version", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load version");
  return r.json();
}

/** Polls the catalogue and refetches the full list when the version changes. */
export function useProducts() {
  const qc = useQueryClient();
  const knownVersion = useRef<string | null>(null);

  const full = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 60, // 1 hour – we control freshness via the version poll
  });

  const version = useQuery({
    queryKey: ["products-version"],
    queryFn: fetchVersion,
    refetchInterval: 15_000, // poll every 15 s – cheap, just an aggregate
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: false,
  });

  // Whenever the version query bumps, invalidate the full list (and remember it).
  useEffect(() => {
    const v = version.data?.version;
    if (!v) return;
    if (knownVersion.current === null) {
      knownVersion.current = v;
      return;
    }
    if (v !== knownVersion.current) {
      knownVersion.current = v;
      qc.invalidateQueries({ queryKey: ["products"] });
    }
  }, [version.data?.version, qc]);

  // Keep the known version in sync with the full list, too.
  useEffect(() => {
    if (full.data?.version) knownVersion.current = full.data.version;
  }, [full.data?.version]);

  return {
    products: full.data?.items ?? [],
    loading: full.isLoading,
    error: full.error,
    refetch: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["products-version"] });
    },
  };
}

/** Lets admin code force every visible storefront to refetch. */
export function useRefetchProducts() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["products"] });
    qc.invalidateQueries({ queryKey: ["products-version"] });
  };
}
