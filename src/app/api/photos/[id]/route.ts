import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { photoDir, legacyPhotoDir } from "@/lib/photos";

export const dynamic = "force-dynamic";

/**
 * GET /api/photos/[id]  – serves a product photo from disk.
 * The URL carries ?v=<timestamp>, so a long cache lifetime is safe: a new upload
 * gets a new URL. Falls back to the old /public location so photos uploaded
 * before this fix keep working.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const n = Number(id.replace(/\.jpg$/i, ""));
  if (!Number.isInteger(n) || n <= 0) {
    return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  for (const dir of [photoDir(), legacyPhotoDir()]) {
    try {
      const bytes = await readFile(path.join(dir, `${n}.jpg`));
      return new NextResponse(new Uint8Array(bytes), {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      /* try the next location */
    }
  }
  return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
}
