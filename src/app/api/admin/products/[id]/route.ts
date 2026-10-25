import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/catalogue";
import { removePublic, productPhotoKey } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** DELETE /api/admin/products/[id] – remove a product from the catalogue. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const num = Number(id);
  if (!Number.isInteger(num) || num <= 0) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    await db.product.delete({ where: { id: num } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Best-effort: remove the product's photo from Supabase Storage.
  await removePublic(productPhotoKey(num)).catch(() => {});
  return NextResponse.json({ ok: true });
}
