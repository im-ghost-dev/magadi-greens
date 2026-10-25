"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/api";
import { ProductImage } from "@/components/storefront/ProductImage";

/** Photo picker: camera or gallery, preview, browser-side compression via uploadImage(). */
export function PhotoButton({
  value,
  onChange,
  alt,
  targetId,
  size = "h-16 w-16",
}: {
  value?: string | null | undefined;
  onChange: (url: string | null) => void;
  alt: string;
  targetId?: string;
  size?: string;
}) {
  const cam = useRef<HTMLInputElement>(null);
  const gal = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handle(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadImage(file, targetId);
      onChange(url);
      toast.success("Photo ready");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't use that photo.");
    } finally {
      setBusy(false);
    }
  }

  const btn =
    "flex h-11 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary-deep hover:bg-secondary cursor-pointer";

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <ProductImage src={value} alt={alt} className={`${size} rounded-xl`} />
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        {value && !busy && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove photo"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <button
        type="button"
        className={btn}
        aria-label="Take photo"
        onClick={() => cam.current?.click()}
      >
        <Camera className="h-4 w-4" />
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Choose from gallery"
        onClick={() => gal.current?.click()}
      >
        <ImagePlus className="h-4 w-4" />
      </button>
      <input
        ref={cam}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={gal}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
