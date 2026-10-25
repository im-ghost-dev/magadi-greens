"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { getProductImageUrl } from "@/lib/product-images";

type Props = {
  src: string | null | undefined;
  alt: string;
  /** Extra classes for the wrapper (set size + rounding here). */
  className?: string;
  /** Render larger placeholder icon (for big product cards). */
  big?: boolean;
};

/**
 * Product image with tailored real image resolver and graceful leaf fallback.
 */
export function ProductThumb({ src, alt, className = "", big = false }: Props) {
  const [failed, setFailed] = useState(false);
  const effectiveSrc = !failed ? (src || getProductImageUrl(alt)) : null;

  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-g50 to-g100 ${className}`}
    >
      {effectiveSrc ? (
        <img
          src={effectiveSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="grid place-items-center text-g600/50" aria-hidden>
          <Leaf className={big ? "size-10" : "size-5"} strokeWidth={1.75} />
        </span>
      )}
    </div>
  );
}
