"use client";

import { useQuery } from "@tanstack/react-query";
import { SplashLoader } from "./SplashLoader";
import { useSettings } from "@/lib/use-settings";

export function SplashWrapper() {
  const { isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    },
    staleTime: 60_000,
  });

  const { settings } = useSettings();
  const shopName = settings?.shopName || "MAGADI GREENS";

  return <SplashLoader name={shopName} ready={!isLoading} />;
}
