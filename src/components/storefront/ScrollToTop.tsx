"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    let ticking = false;

    function update() {
      ticking = false;
      const y = Math.max(0, window.scrollY || window.pageYOffset || 0);
      setVisible(y > 300);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function handleScrollToTop() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  // If floating cart bar is shown on small mobile screens (< 640px), raise up button to not overlap
  const hasCartBar = count > 0;

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      tabIndex={visible ? 0 : -1}
      aria-label="Scroll to top"
      title="Scroll to top"
      style={{
        position: "fixed",
        left: "max(20px, env(safe-area-inset-left, 20px))",
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 45,
        background: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
      }}
      className={cn(
        "group cursor-pointer select-none",
        "text-[#18241a] dark:text-[#f9fafb]",
        "dark:bg-white/15 dark:border-white/20 dark:shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:scale-105 hover:-translate-y-0.5 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#0f1512]",
        hasCartBar
          ? "bottom-[max(84px,calc(env(safe-area-inset-bottom,0px)+84px))] sm:bottom-[max(20px,calc(env(safe-area-inset-bottom,0px)+20px))]"
          : "bottom-[max(20px,calc(env(safe-area-inset-bottom,0px)+20px))]",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 drop-shadow-xs transition-transform duration-200 group-hover:-translate-y-0.5"
        aria-hidden="true"
      >
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}
