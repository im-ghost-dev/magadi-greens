"use client";

import { useQuery } from "@tanstack/react-query";

export type Special = {
  id: string;
  productId: number | null;
  title: string;
  priceText: string;
  label: string;
  img: string | null;
  sort: number;
};

async function fetchSpecials(): Promise<{ items: Special[] }> {
  const r = await fetch("/api/specials", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load specials");
  return r.json();
}

/** Loads Today's Special slots, refreshed at most every 60 s. */
export function useSpecials() {
  const q = useQuery({
    queryKey: ["specials"],
    queryFn: fetchSpecials,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 55_000,
  });
  return { specials: q.data?.items ?? [], loading: q.isLoading };
}
