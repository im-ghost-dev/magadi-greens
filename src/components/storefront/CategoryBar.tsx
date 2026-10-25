"use client";

import { CATEGORIES } from "@/lib/catalogue-client";

type Props = {
  active: string;
  onSelect: (cat: string) => void;
};

export function CategoryBar({ active, onSelect }: Props) {
  return (
    <div
      id="shop"
      style={{ top: "var(--header-h, 72px)" }}
      className="sticky z-20 -mx-4 scroll-mt-[calc(var(--header-h,72px)+8px)] border-b border-border/40 bg-background/60 px-4 pb-2 pt-3 backdrop-blur-md"
    >
      <div
        style={{
          display: "flex",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          gap: "10px",
          maskImage:
            "linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%)",
        }}
        className="no-scrollbar mask-edge-fade flex gap-[10px] overflow-x-auto pb-1"
      >
        {CATEGORIES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            aria-pressed={active === key}
            className={`flex-none shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors cursor-pointer ${
              active === key
                ? "border-primary bg-primary text-primary-foreground shadow-card"
                : "border-border bg-card/80 text-foreground hover:bg-secondary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
