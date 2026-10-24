import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/catalogue";
import { photoDir, photoUrl } from "@/lib/photos";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB after the browser has resized the photo

/**
 * POST /api/admin/upload
 * Multipart form data: { file: File, id: string }
 * Saves the image to the photo directory (see lib/photos.ts) and updates the
 * product's `img` field to /api/photos/{id}?v=<timestamp>. Returns the new URL.
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
    return NextResponse.json({ error: "Image is too large (max 8 MB)" }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id } });
  if (!product) {
    return NextResponse.json({ error: `Product ${id} not found` }, { status: 404 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  // JPEG files start with FF D8 FF. The browser always sends JPEG, so reject anything else.
  if (bytes.length < 3 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) {
    return NextResponse.json({ error: "Please upload a JPG or PNG photo" }, { status: 400 });
  }

  try {
    const dir = photoDir();
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${id}.jpg`), bytes);
  } catch (e) {
    console.error("Photo write failed:", e);
    return NextResponse.json({ error: "The server couldn't save the photo. Check folder permissions." }, { status: 500 });
  }

  const imgUrl = photoUrl(id);
  await db.product.update({ where: { id }, data: { img: imgUrl } });
  return NextResponse.json({ ok: true, img: imgUrl });
}
