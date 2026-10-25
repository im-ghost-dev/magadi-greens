"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";

type Props = {
  src: string | null | undefined;
  alt: string;
  /** Extra classes for the wrapper (set size + rounding here). */
  className?: string;
  /** Render larger placeholder icon (for big product cards). */
  big?: boolean;
};

/**
 * Product image with a clean, neutral placeholder.
 *
 * Previously the app showed emojis guessed from the product name, which were
 * often wrong (e.g. Amla → broccoli, Anjeer → apple). We now show a tasteful
 * neutral leaf placeholder on a soft green background whenever there's no photo
 * (or the photo fails to load), and the real photo once one is uploaded.
 */
export function ProductThumb({ src, alt, className = "", big = false }: Props) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;

  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-g50 to-g100 ${className}`}
    >
      {showImg ? (
        <img
          src={src as string}
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
