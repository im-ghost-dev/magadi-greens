/**
 * Photo helpers.
 *
 * Photos now live in Supabase Storage (see lib/supabase.ts). A product's `img`
 * column holds the FULL public URL returned by Storage, e.g.
 *   https://xyz.supabase.co/storage/v1/object/public/product-photos/products/3.webp?v=1720000000000
 *
 * The storefront loads these URLs directly, so there is no local /public or
 * /api/photos serving path any more.
 */

/** True if `url` looks like a valid photo URL (Supabase Storage, /uploads/, web URLs like Unsplash, relative paths, data URIs, or empty to clear). */
export function isStoredPhotoUrl(url: string): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return true;
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:image/")
  );
}
