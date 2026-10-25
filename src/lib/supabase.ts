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
import fs from "fs/promises";
import path from "path";

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
 * If Supabase is configured, uploads to Supabase Storage bucket.
 * Otherwise, falls back to local disk storage in /public/uploads/ for local dev.
 */
export async function uploadPublic(
  key: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  const sb = supabaseAdmin();
  if (sb) {
    const { error } = await sb.storage.from(SUPABASE_BUCKET).upload(key, bytes, {
      contentType,
      upsert: true, // replace the previous photo for this item
      cacheControl: "31536000", // 1 year; we cache-bust with ?v=
    });
    if (error) throw new Error(error.message);

    const { data } = sb.storage.from(SUPABASE_BUCKET).getPublicUrl(key);
    return `${data.publicUrl}?v=${Date.now()}`;
  }

  // Local fallback: save to /public/uploads/
  const filePath = path.join(process.cwd(), "public", "uploads", key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, bytes);
  return `/uploads/${key}?v=${Date.now()}`;
}

/** Removes an object from Storage or local fallback. Safe to call even if it doesn't exist. */
export async function removePublic(key: string): Promise<void> {
  const sb = supabaseAdmin();
  if (sb) {
    await sb.storage.from(SUPABASE_BUCKET).remove([key]);
    return;
  }

  try {
    const filePath = path.join(process.cwd(), "public", "uploads", key);
    await fs.unlink(filePath);
  } catch {
    /* ignore */
  }
}

/** Object path for a product photo. */
export const productPhotoKey = (id: number) => `products/${id}.webp`;

/** Object path for a "Today's Special" photo. */
export const specialPhotoKey = (id: string) => `specials/${id}.webp`;
