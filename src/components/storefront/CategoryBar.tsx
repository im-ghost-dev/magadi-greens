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
      className="sticky z-20 -mx-4 scroll-mt-[calc(var(--header-h,72px)+8px)] border-b border-border bg-background/95 px-4 pb-2 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            aria-pressed={active === key}
            className={`flex-none whitespace-nowrap rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors ${
              active === key
                ? "border-g900 bg-g900 text-white"
                : "border-border bg-white hover:border-g600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
