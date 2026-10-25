import { Leaf } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/** Product photo with a neutral leaf placeholder when no image is set. */
export const ProductImage = forwardRef<
  HTMLDivElement,
  { src?: string | null | undefined; alt: string; className?: string | undefined }
>(function ProductImage({ src, alt, className }, ref) {
  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-cream", className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(e) => {
            // If image fails, replace with placeholder
            const target = e.currentTarget;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              const placeholder = parent.querySelector(".leaf-fallback");
              if (placeholder) placeholder.classList.remove("hidden");
            }
          }}
        />
      ) : null}
      <div
        className={cn(
          "leaf-fallback flex h-full w-full items-center justify-center bg-gradient-to-br from-cream to-secondary",
          src ? "hidden absolute inset-0" : "",
        )}
      >
        <Leaf className="h-1/3 w-1/3 text-primary/25" strokeWidth={1.25} aria-hidden />
      </div>
    </div>
  );
});
