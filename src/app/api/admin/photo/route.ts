import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/catalogue";
import { removePublic, productPhotoKey } from "@/lib/supabase";

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
  // Best-effort: delete the object from Supabase Storage.
  await removePublic(productPhotoKey(id)).catch(() => {});
  return NextResponse.json({ ok: true });
}
