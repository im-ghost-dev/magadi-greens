import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/catalogue";
import { uploadPublic, productPhotoKey } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB after the browser has resized + WebP'd the photo

/** WebP magic bytes: "RIFF"...."WEBP". */
function isWebp(b: Uint8Array): boolean {
  return (
    b.length > 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && // RIFF
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 // WEBP
  );
}

/**
 * POST /api/admin/upload
 * Multipart form data: { file: File (WebP), id: string }
 * Uploads the image to Supabase Storage and stores the public URL on the
 * product's `img` field. Returns the new URL (cache-busted with ?v=).
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
  const id = Number(form.get("id"));
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing image file" }, { status: 400 });
  }
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Missing or invalid product id" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 4 MB)" }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: `Product ${id} not found` }, { status: 404 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isWebp(bytes)) {
    return NextResponse.json({ error: "Please upload a WebP photo (the app converts automatically)." }, { status: 400 });
  }

  let imgUrl: string;
  try {
    imgUrl = await uploadPublic(productPhotoKey(id), bytes, "image/webp");
  } catch (e) {
    console.error("Photo upload failed:", e);
    return NextResponse.json(
      { error: "The server couldn't save the photo. Check the Supabase Storage config." },
      { status: 500 },
    );
  }

  await db.product.update({ where: { id }, data: { img: imgUrl } });
  return NextResponse.json({ ok: true, img: imgUrl });
}
