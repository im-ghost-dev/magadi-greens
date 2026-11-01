import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/catalogue";
import { uploadPublic, removePublic, logoPhotoKey } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * POST /api/admin/settings/logo (admin only)
 * Multipart form data: { file: File }
 * Uploads a store logo to Storage/uploads and saves the URL on Settings.
 */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Logo image must be under 5 MB" }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const contentType = file.type || "image/webp";

  let logoUrl: string;
  try {
    logoUrl = await uploadPublic(logoPhotoKey(), bytes, contentType);
  } catch (e) {
    console.error("Logo upload failed:", e);
    return NextResponse.json(
      { error: "The server couldn't save the logo." },
      { status: 500 },
    );
  }

  await db.settings.upsert({
    where: { id: 1 },
    create: { id: 1, logoUrl },
    update: { logoUrl },
  });

  return NextResponse.json({ ok: true, logoUrl });
}

/**
 * DELETE /api/admin/settings/logo (admin only)
 * Clears the store logo, reverting back to the default leaf mark.
 */
export async function DELETE() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.settings.upsert({
    where: { id: 1 },
    create: { id: 1, logoUrl: null },
    update: { logoUrl: null },
  });

  await removePublic(logoPhotoKey()).catch(() => {});

  return NextResponse.json({ ok: true });
}
