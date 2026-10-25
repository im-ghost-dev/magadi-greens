import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/catalogue";
import { removePublic, specialPhotoKey } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** DELETE /api/admin/specials/[id] (auth) – remove a Today's Special slot. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  try {
    await db.special.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await removePublic(specialPhotoKey(id)).catch(() => {});
  return NextResponse.json({ ok: true });
}
