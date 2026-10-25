import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/catalogue";
import { cleanWhatsApp } from "@/lib/settings";

export const dynamic = "force-dynamic";

type Body = {
  shopName?: string;
  tagline?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  hours?: string;
  mapsUrl?: string;
};

const str = (v: unknown, max = 500) =>
  typeof v === "string" ? v.trim().slice(0, max) : undefined;

/**
 * PUT /api/admin/settings  (auth)
 * Partial update of the shop/contact info. Changing `whatsapp` changes where
 * new orders are sent.
 */
export async function PUT(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const data: Record<string, string> = {};
  const shopName = str(body.shopName, 80);
  const tagline = str(body.tagline, 120);
  const phone = str(body.phone, 40);
  const address = str(body.address, 400);
  const hours = str(body.hours, 120);
  const mapsUrl = str(body.mapsUrl, 500);

  if (shopName !== undefined) {
    if (!shopName) return NextResponse.json({ error: "Shop name can't be empty" }, { status: 400 });
    data.shopName = shopName;
  }
  if (tagline !== undefined) data.tagline = tagline;
  if (phone !== undefined) data.phone = phone;
  if (address !== undefined) data.address = address;
  if (hours !== undefined) data.hours = hours;
  if (mapsUrl !== undefined) {
    if (mapsUrl && !/^https?:\/\//i.test(mapsUrl)) {
      return NextResponse.json({ error: "Maps link must start with http(s)://" }, { status: 400 });
    }
    data.mapsUrl = mapsUrl;
  }
  if (body.whatsapp !== undefined) {
    const wa = cleanWhatsApp(body.whatsapp);
    if (wa.length < 10 || wa.length > 15) {
      return NextResponse.json(
        { error: "WhatsApp number must be the full number with country code (e.g. 919148112233)." },
        { status: 400 },
      );
    }
    data.whatsapp = wa;
  }

  const row = await db.settings.upsert({
    where: { id: 1 },
    create: { id: 1, ...data },
    update: data,
  });

  return NextResponse.json({
    ok: true,
    settings: {
      shopName: row.shopName,
      tagline: row.tagline,
      phone: row.phone,
      whatsapp: row.whatsapp,
      address: row.address,
      hours: row.hours,
      mapsUrl: row.mapsUrl,
      updatedAt: row.updatedAt.toISOString(),
    },
  });
}
