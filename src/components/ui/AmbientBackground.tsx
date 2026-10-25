"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Unconditional fixed ambient mesh background supporting both light and dark modes.
 *
 * Requirements:
 *  - Base background color:
 *      Light: #f8fafc
 *      Dark:  #0f1512
 *  - Layer: fixed inset-0 pointer-events-none z-0 overflow-hidden (unconditionally stays visible on all views & scroll depths)
 *  - Top-Left Glow:
 *      Light: radial-gradient(circle, rgba(125, 211, 252, 0.45) 0%, transparent 70%)
 *      Dark:  radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)
 *  - Top-Right Glow:
 *      Light: radial-gradient(circle, rgba(233, 213, 255, 0.45) 0%, transparent 70%)
 *      Dark:  radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)
 *  - Mid Glow (top: 35%, left):
 *      Light: radial-gradient(circle, rgba(125, 211, 252, 0.35) 0%, transparent 70%)
 *      Dark:  radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%)
 *  - Lower Glow (top: 65%, right):
 *      Light: radial-gradient(circle, rgba(233, 213, 255, 0.35) 0%, transparent 70%)
 *      Dark:  radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 70%)
 */
export function AmbientBackground({ className, children }: AmbientBackgroundProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen w-full overflow-x-hidden transition-colors duration-500",
        "bg-[#f8fafc] dark:bg-[#0f1512] text-foreground",
        className,
      )}
    >
      {/* Unconditional Fixed Ambient Background Layer (stays visible regardless of page height or scroll) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Light Mode Glow Spotlights */}
        <div className="absolute inset-0 block dark:hidden">
          {/* Top-Left Glow */}
          <div
            className="absolute -top-[12%] -left-[12%] h-[680px] w-[680px] rounded-full blur-3xl opacity-85 md:h-[820px] md:w-[820px]"
            style={{
              background:
                "radial-gradient(circle, rgba(125, 211, 252, 0.45) 0%, transparent 70%)",
            }}
          />
          {/* Top-Right Glow */}
          <div
            className="absolute -top-[10%] -right-[12%] h-[680px] w-[680px] rounded-full blur-3xl opacity-85 md:h-[820px] md:w-[820px]"
            style={{
              background:
                "radial-gradient(circle, rgba(233, 213, 255, 0.45) 0%, transparent 70%)",
            }}
          />
          {/* Mid/Lower Ambient Glow Blob (left) */}
          <div
            className="absolute top-[35%] -left-[10%] h-[640px] w-[640px] rounded-full blur-3xl opacity-75 md:h-[750px] md:w-[750px]"
            style={{
              background:
                "radial-gradient(circle, rgba(125, 211, 252, 0.35) 0%, transparent 70%)",
            }}
          />
          {/* Mid/Lower Ambient Glow Blob (right) */}
          <div
            className="absolute top-[65%] -right-[10%] h-[640px] w-[640px] rounded-full blur-3xl opacity-75 md:h-[750px] md:w-[750px]"
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
            className="absolute -top-[12%] -left-[12%] h-[680px] w-[680px] rounded-full blur-3xl opacity-85 md:h-[820px] md:w-[820px]"
            style={{
              background:
                "radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)",
            }}
          />
          {/* Top-Right Glow */}
          <div
            className="absolute -top-[10%] -right-[12%] h-[680px] w-[680px] rounded-full blur-3xl opacity-85 md:h-[820px] md:w-[820px]"
            style={{
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
            }}
          />
          {/* Mid/Lower Ambient Glow Blob (left) */}
          <div
            className="absolute top-[35%] -left-[10%] h-[640px] w-[640px] rounded-full blur-3xl opacity-75 md:h-[750px] md:w-[750px]"
            style={{
              background:
                "radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, transparent 70%)",
            }}
          />
          {/* Mid/Lower Ambient Glow Blob (right) */}
          <div
            className="absolute top-[65%] -right-[10%] h-[640px] w-[640px] rounded-full blur-3xl opacity-75 md:h-[750px] md:w-[750px]"
            style={{
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 70%)",
            }}
          />
        </div>
      </div>

      {/* Main interactive page content */}
      <div
        className="relative z-[1] w-full min-h-screen"
        style={{ background: "transparent" }}
      >
        {children}
      </div>
    </div>
  );
}
