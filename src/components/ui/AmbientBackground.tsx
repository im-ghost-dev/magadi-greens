"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Responsive full-screen ambient mesh background container supporting both
 * light and dark themes, inspired by modern Web3 platforms like OpenSea.
 *
 * Dark Mode:
 *  - Base background: Deep charcoal / near-black (#11161B).
 *  - Top-left: Muted teal / cyan ambient glow (#0891b2 / #164e63 with blur-3xl).
 *  - Top-right: Muted indigo / violet ambient glow (#4c1d95 / #581c87 with blur-3xl).
 *  - Fades smoothly into the dark base before reaching the lower half.
 *
 * Light Mode:
 *  - Base background: Pure white (#ffffff).
 *  - Top-left: Soft pastel sky blue (#bae6fd / #7dd3fc with 35% opacity, blur-3xl).
 *  - Top-right: Soft pastel lavender / mauve (#fbcfe8 / #e9d5ff with 35% opacity, blur-3xl).
 *  - Washes out seamlessly into pure white downward.
 */
export function AmbientBackground({ className, children }: AmbientBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full transition-colors duration-500",
        "bg-[#ffffff] dark:bg-[#11161B] text-foreground",
        className,
      )}
    >
      {/* Fixed Ambient Background Overlay (behind all interactive content) */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Light Mode Glow Spotlights */}
        <div className="absolute inset-0 block dark:hidden">
          {/* Top-left soft pastel sky-blue glow */}
          <div className="absolute -top-[12%] -left-[10%] h-[550px] w-[550px] rounded-full bg-[#bae6fd]/40 blur-3xl md:h-[680px] md:w-[680px]" />
          {/* Top-right soft pastel lavender / mauve glow */}
          <div className="absolute -top-[10%] -right-[10%] h-[520px] w-[520px] rounded-full bg-[#fbcfe8]/40 blur-3xl md:h-[680px] md:w-[680px]" />
          {/* Soft central sky-blue wash */}
          <div className="absolute top-[6%] left-[25%] h-[380px] w-[480px] rounded-full bg-[#7dd3fc]/20 blur-3xl" />
          {/* Gradient mask to wash out seamlessly into pure white downward */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ffffff]/60 to-[#ffffff]" />
        </div>

        {/* Dark Mode Glow Spotlights */}
        <div className="absolute inset-0 hidden dark:block">
          {/* Top-left muted teal / cyan ambient glow */}
          <div className="absolute -top-[15%] -left-[10%] h-[550px] w-[550px] rounded-full bg-[#0891b2]/25 blur-3xl md:h-[720px] md:w-[720px]" />
          {/* Secondary teal mesh spotlight */}
          <div className="absolute top-[5%] left-[6%] h-[420px] w-[420px] rounded-full bg-[#164e63]/30 blur-3xl" />
          {/* Top-right muted indigo / violet ambient glow */}
          <div className="absolute -top-[15%] -right-[10%] h-[550px] w-[550px] rounded-full bg-[#4c1d95]/30 blur-3xl md:h-[720px] md:w-[720px]" />
          {/* Secondary violet mesh spotlight */}
          <div className="absolute top-[8%] right-[8%] h-[400px] w-[400px] rounded-full bg-[#581c87]/25 blur-3xl" />
          {/* Gradient mask to smoothly fade into deep charcoal base */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#11161B]/60 to-[#11161B]" />
        </div>
      </div>

      {children}
    </div>
  );
}
