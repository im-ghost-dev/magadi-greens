import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/catalogue";
import { uploadPublic, specialPhotoKey } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024;

function isWebp(b: Uint8Array): boolean {
  return (
    b.length > 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  );
}

/**
 * POST /api/admin/specials/upload (auth)
 * Multipart: { file: File (WebP), id: string (special id) }
 * Uploads a Today's Special image to Storage and saves its URL on the slot.
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
  const id = String(form.get("id") || "");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }
  if (!id) {
    return NextResponse.json({ error: "Missing slot id" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 4 MB)" }, { status: 400 });
  }

  const slot = await db.special.findUnique({ where: { id } });
  if (!slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isWebp(bytes)) {
    return NextResponse.json({ error: "Please upload a WebP photo." }, { status: 400 });
  }

  let imgUrl: string;
  try {
    imgUrl = await uploadPublic(specialPhotoKey(id), bytes, "image/webp");
  } catch (e) {
    console.error("Special photo upload failed:", e);
    return NextResponse.json(
      { error: "The server couldn't save the photo. Check Supabase Storage config." },
      { status: 500 },
    );
  }

  await db.special.update({ where: { id }, data: { img: imgUrl } });
  return NextResponse.json({ ok: true, img: imgUrl });
}
