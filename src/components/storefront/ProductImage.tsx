"use client";

import { Leaf } from "lucide-react";
import { forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import { getProductImageUrl } from "@/lib/product-images";

/** Product photo with real produce image fallback and neutral leaf backup. */
export const ProductImage = forwardRef<
  HTMLDivElement,
  { src?: string | null | undefined; alt: string; className?: string | undefined }
>(function ProductImage({ src, alt, className }, ref) {
  const [hasError, setHasError] = useState(false);
  const effectiveSrc = (!hasError && (src || getProductImageUrl(alt))) || null;

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-cream", className)}>
      {effectiveSrc ? (
        <img
          src={effectiveSrc}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setHasError(true)}
        />
      ) : null}
      <div
        className={cn(
          "leaf-fallback flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-secondary",
          effectiveSrc ? "hidden absolute inset-0" : "",
        )}
      >
        <Leaf className="h-1/3 w-1/3 text-primary/25" strokeWidth={1.25} aria-hidden />
      </div>
    </div>
  );
});
