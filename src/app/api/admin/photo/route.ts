import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/catalogue";
import { photoDir, legacyPhotoDir } from "@/lib/photos";
import { unlink } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

/** POST /api/admin/photo  Body: { id: number }  – clears the product's photo. */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { id?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const id = Number(body.id);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await db.product.update({ where: { id }, data: { img: null } }).catch(() => {});
  // Best-effort: delete the file from both the current and the old location.
  for (const dir of [photoDir(), legacyPhotoDir()]) {
    await unlink(path.join(dir, `${id}.jpg`)).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
