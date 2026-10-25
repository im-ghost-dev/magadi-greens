"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Responsive full-height ambient mesh background supporting both light and dark modes.
 *
 * Requirements:
 *  - Base background color:
 *      Light: #f8fafc
 *      Dark:  #0f1512
 *  - Layer: absolute inset-0 pointer-events-none z-0 overflow-hidden (min-height: 100%)
 *  - Top-Left Glow:
 *      Light: radial-gradient(circle, rgba(125, 211, 252, 0.45) 0%, transparent 70%)
 *      Dark:  radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)
 *  - Top-Right Glow:
 *      Light: radial-gradient(circle, rgba(233, 213, 255, 0.45) 0%, transparent 70%)
 *      Dark:  radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)
 *  - Mid Glow (top: 35%, left):
 *      Light: radial-gradient(circle, rgba(125, 211, 252, 0.35) 0%, transparent 70%)
 *      Dark:  radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%)
 *  - Lower Glow (top: 70%, right):
 *      Light: radial-gradient(circle, rgba(233, 213, 255, 0.35) 0%, transparent 70%)
 *      Dark:  radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 70%)
 *  - Parallax Shift:
 *      transform: translate3d(0, ${scrollY * -0.15}px, 0) via requestAnimationFrame
 */
export function AmbientBackground({ className, children }: AmbientBackgroundProps) {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        if (parallaxRef.current) {
          const scrollY = window.scrollY || window.pageYOffset || 0;
          parallaxRef.current.style.transform = `translate3d(0, ${scrollY * -0.15}px, 0)`;
        }
        rafId = null;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-x-hidden transition-colors duration-500",
        "bg-[#f8fafc] dark:bg-[#0f1512] text-foreground",
        className,
      )}
    >
      {/* Scrollable Ambient Background Layer (spans full scrollable height) */}
      <div
        ref={parallaxRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none will-change-transform"
        style={{ minHeight: "120%", bottom: "-20%" }}
        aria-hidden="true"
      >
        {/* Light Mode Glow Spotlights */}
        <div className="absolute inset-0 block dark:hidden">
          {/* Top-Left Glow */}
          <div
            className="absolute -top-[4%] -left-[10%] h-[720px] w-[720px] rounded-full blur-3xl md:h-[860px] md:w-[860px]"
            style={{
              background:
                "radial-gradient(circle, rgba(125, 211, 252, 0.45) 0%, transparent 70%)",
            }}
          />
          {/* Top-Right Glow */}
          <div
            className="absolute -top-[3%] -right-[10%] h-[720px] w-[720px] rounded-full blur-3xl md:h-[860px] md:w-[860px]"
            style={{
              background:
                "radial-gradient(circle, rgba(233, 213, 255, 0.45) 0%, transparent 70%)",
            }}
          />
          {/* Mid Scroll Glow (top: 35%, left) */}
          <div
            className="absolute top-[35%] -left-[10%] h-[680px] w-[680px] rounded-full blur-3xl md:h-[820px] md:w-[820px]"
            style={{
              background:
                "radial-gradient(circle, rgba(125, 211, 252, 0.35) 0%, transparent 70%)",
            }}
          />
          {/* Lower Scroll Glow (top: 70%, right) */}
          <div
            className="absolute top-[70%] -right-[10%] h-[680px] w-[680px] rounded-full blur-3xl md:h-[820px] md:w-[820px]"
            style={{
              background:
                "radial-gradient(circle, rgba(233, 213, 255, 0.35) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Dark Mode Glow Spotlights */}
        <div className="absolute inset-0 hidden dark:block">
          {/* Top-Left Glow */}
          <div
            className="absolute -top-[4%] -left-[10%] h-[720px] w-[720px] rounded-full blur-3xl md:h-[860px] md:w-[860px]"
            style={{
              background:
                "radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)",
            }}
          />
          {/* Top-Right Glow */}
          <div
            className="absolute -top-[3%] -right-[10%] h-[720px] w-[720px] rounded-full blur-3xl md:h-[860px] md:w-[860px]"
            style={{
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
            }}
          />
          {/* Mid Scroll Glow (top: 35%, left) */}
          <div
            className="absolute top-[35%] -left-[10%] h-[680px] w-[680px] rounded-full blur-3xl md:h-[820px] md:w-[820px]"
            style={{
              background:
                "radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%)",
            }}
          />
          {/* Lower Scroll Glow (top: 70%, right) */}
          <div
            className="absolute top-[70%] -right-[10%] h-[700px] w-[700px] rounded-full blur-3xl md:h-[820px] md:w-[820px]"
            style={{
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 70%)",
            }}
          />
        </div>
      </div>

      {/* Main interactive page content */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
}
