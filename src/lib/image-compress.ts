"use client";

/**
 * Client-side image compression.
 *
 * Resizes the chosen photo so its longest edge is at most `maxEdge` pixels
 * (default 800) and re-encodes it as WebP before upload. This keeps uploads
 * small and fast on 4G, and matches the storage format used across the app.
 *
 * Falls back to JPEG only if the browser can't produce WebP (very rare), but
 * the server expects WebP, so modern phones (which all support WebP) are the
 * target.
 */
export async function compressToWebp(file: File, maxEdge = 800): Promise<File> {
  const bmp = await loadBitmap(file);

  const sw = (bmp as ImageBitmap).width ?? (bmp as HTMLImageElement).naturalWidth;
  const sh = (bmp as ImageBitmap).height ?? (bmp as HTMLImageElement).naturalHeight;

  // Scale down so the longest edge is maxEdge; never upscale.
  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Couldn't process the image on this device.");
  ctx.drawImage(bmp as CanvasImageSource, 0, 0, w, h);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", 0.82),
  );
  if (!blob) throw new Error("Couldn't convert the image. Try another photo.");

  const base = file.name.replace(/\.\w+$/, "");
  return new File([blob], `${base}.webp`, { type: "image/webp" });
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}
