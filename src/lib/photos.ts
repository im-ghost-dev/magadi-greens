import path from "node:path";

/**
 * Where uploaded product photos are stored on disk.
 *
 * They must NOT go in /public: a running production Next.js server only serves
 * files that existed in /public when the app was built, so photos uploaded later
 * would be saved but never served (404). Instead we store them next to the
 * database and serve them through /api/photos/[id].
 *
 * Override with the PHOTO_DIR environment variable if you want another location.
 */
export function photoDir(): string {
  if (process.env.PHOTO_DIR) return process.env.PHOTO_DIR;
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("file:")) {
    const p = url.slice("file:".length).split("?")[0];
    if (path.isAbsolute(p)) return path.join(path.dirname(p), "photos");
  }
  return path.join(process.cwd(), "data", "photos");
}

/** Old location used by the first version (files were saved here but never served). */
export function legacyPhotoDir(): string {
  return path.join(process.cwd(), "public", "images", "products");
}

/** Public URL for a product photo; `v` busts browser caches when the photo changes. */
export const photoUrl = (id: number, v: number = Date.now()) => `/api/photos/${id}?v=${v}`;
