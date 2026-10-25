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

/** True if `url` looks like a Supabase public Storage URL (http/https). */
export function isStoredPhotoUrl(url: string): boolean {
  return /^https?:\/\/.+\/storage\/v1\/object\/public\/.+/i.test(url);
}
