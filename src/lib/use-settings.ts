"use client";

import { useQuery } from "@tanstack/react-query";
import { DEFAULT_SETTINGS, type Settings } from "./settings";

async function fetchSettings(): Promise<Settings> {
  const r = await fetch("/api/settings", { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to load settings");
  return r.json();
}

/**
 * Loads the shop/contact settings and refreshes them at most every 60 s
 * (well within the 5-minute freshness requirement). Falls back to sensible
 * defaults until the first fetch resolves.
 */
export function useSettings() {
  const q = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 55_000,
  });
  return {
    settings: q.data ?? DEFAULT_SETTINGS,
    loading: q.isLoading,
    refetch: q.refetch,
  };
}
