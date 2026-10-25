"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when the user has asked for reduced motion
 * (prefers-reduced-motion: reduce). Components use this to disable or soften
 * animations for accessibility. SSR-safe: defaults to false until mounted.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return reduced;
}
