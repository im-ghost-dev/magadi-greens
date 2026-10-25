"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

/** Quantity label that slides up when increasing and down when decreasing. */
export function AnimatedQty({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string | undefined;
}) {
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState(1);

  if (value !== prev) {
    setDir(value > prev ? 1 : -1);
    setPrev(value);
  }

  return (
    <span
      className={cn(
        "relative inline-flex h-5 items-center justify-center overflow-hidden",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={dir}>
        <motion.span
          key={label}
          custom={dir}
          initial={{ y: dir * 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: dir * -14, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="block whitespace-nowrap"
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
