/**
 * Supabase Storage helpers (server-only).
 *
 * Product and "Today's Special" photos are stored in a public Storage bucket so
 * the storefront can load them directly by URL (fast, CDN-cached, free-tier
 * friendly). Uploads use the service-role key and therefore MUST only ever run
 * on the server (API routes). Never import this file into client code.
 *
 * Required environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL     – your project URL (e.g. https://xyz.supabase.co)
 *   SUPABASE_SERVICE_ROLE_KEY    – service_role secret (server-only!)
 *   SUPABASE_BUCKET              – optional, defaults to "product-photos"
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "product-photos";

let cached: SupabaseClient | null = null;

/** Returns a cached service-role Supabase client, or null if env isn't set. */
export function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (cached) return cached;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/**
 * Uploads image bytes to Storage and returns the public URL (cache-busted).
 * `key` is the object path inside the bucket, e.g. "products/3.webp".
 */
export async function uploadPublic(
  key: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  const sb = supabaseAdmin();
  if (!sb) throw new Error("Supabase Storage is not configured on the server.");

  const { error } = await sb.storage.from(SUPABASE_BUCKET).upload(key, bytes, {
    contentType,
    upsert: true, // replace the previous photo for this item
    cacheControl: "31536000", // 1 year; we cache-bust with ?v=
  });
  if (error) throw new Error(error.message);

  const { data } = sb.storage.from(SUPABASE_BUCKET).getPublicUrl(key);
  return `${data.publicUrl}?v=${Date.now()}`;
}

/** Removes an object from Storage. Safe to call even if it doesn't exist. */
export async function removePublic(key: string): Promise<void> {
  const sb = supabaseAdmin();
  if (!sb) return;
  await sb.storage.from(SUPABASE_BUCKET).remove([key]);
}

/** Object path for a product photo. */
export const productPhotoKey = (id: number) => `products/${id}.webp`;

/** Object path for a "Today's Special" photo. */
export const specialPhotoKey = (id: string) => `specials/${id}.webp`;
