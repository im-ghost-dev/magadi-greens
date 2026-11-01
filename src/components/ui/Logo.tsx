"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Leaf-in-circle brand mark or custom logo image */
export function LogoMark({
  className,
  logoUrl,
  alt = "Store logo",
}: {
  className?: string | undefined;
  logoUrl?: string | null;
  alt?: string;
}) {
  const [loadError, setLoadError] = useState(false);

  if (logoUrl && !loadError) {
    return (
      <img
        src={logoUrl}
        alt={alt}
        onError={() => setLoadError(true)}
        className={cn(
          "h-10 w-10 rounded-full object-cover shadow-xs border border-border/40 shrink-0",
          className,
        )}
      />
    );
  }

  return (
    <svg viewBox="0 0 40 40" className={cn("h-10 w-10 shrink-0", className)} aria-hidden>
      <circle cx="20" cy="20" r="20" className="fill-primary" />
      <path
        d="M12 27c0-9 6-15 17-15-0 10-6 16-15 16"
        className="fill-secondary"
      />
      <path
        d="M12 28c3-5 7-9 12-11"
        className="stroke-primary"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  name,
  compact,
  logoUrl,
}: {
  name: string;
  compact?: boolean;
  logoUrl?: string | null;
}) {
  return (
    <span className="flex items-center gap-2 sm:gap-2.5 min-w-0">
      <LogoMark
        logoUrl={logoUrl}
        alt={name}
        className={compact ? "h-9 w-9 shrink-0" : "shrink-0"}
      />
      <span className="text-[15px] sm:text-[17px] font-bold leading-none tracking-[0.04em] sm:tracking-[0.06em] text-primary-deep whitespace-nowrap">
        {name}
      </span>
    </span>
  );
}
