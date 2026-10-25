"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Chip({
  active,
  onClick,
  children,
  pillId,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  pillId?: string | undefined;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      whileTap={{ scale: 0.94 }}
      className={cn(
        "relative flex h-10 shrink-0 flex-shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors cursor-pointer select-none",
        active
          ? "border-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-secondary",
        active && !pillId && "bg-primary shadow-card",
      )}
    >
      {active && pillId && (
        <motion.span
          layoutId={pillId}
          className="absolute inset-0 -z-0 rounded-full bg-primary shadow-card"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative z-10 flex shrink-0 whitespace-nowrap items-center gap-1.5">{children}</span>
    </motion.button>
  );
}

export function CategoryChips<T extends string>({
  options,
  value,
  onChange,
  counts,
  inStockOnly,
  onInStock,
  className,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  counts: Record<string, number>;
  inStockOnly: boolean;
  onInStock: (v: boolean) => void;
  className?: string;
}) {
  const pill = useId();
  return (
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
      className={cn(
        "no-scrollbar mask-edge-fade flex gap-[10px] overflow-x-auto py-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {options.map((o) => (
        <Chip
          key={o}
          active={value === o}
          onClick={() => onChange(o)}
          pillId={pill}
        >
          {o}
          <span
            className={cn(
              "text-xs shrink-0 whitespace-nowrap",
              value === o ? "opacity-80" : "text-muted-foreground",
            )}
          >
            {counts[o] ?? 0}
          </span>
        </Chip>
      ))}
      <span className="mx-1 w-px shrink-0 flex-shrink-0 bg-border" />
      <Chip active={inStockOnly} onClick={() => onInStock(!inStockOnly)}>
        In stock
      </Chip>
    </div>
  );
}
