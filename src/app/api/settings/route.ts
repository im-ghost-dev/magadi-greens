import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/settings
 * Public shop/contact info. Always returns the single Settings row (id = 1),
 * creating it with defaults if it doesn't exist yet.
 */
export async function GET() {
  const row = await db.settings.upsert({
    where: { id: 1 },
    create: { id: 1 },
    update: {},
  });

  return NextResponse.json(
    {
      shopName: row.shopName,
      tagline: row.tagline,
      phone: row.phone,
      whatsapp: row.whatsapp,
      address: row.address,
      hours: row.hours,
      mapsUrl: row.mapsUrl,
      updatedAt: row.updatedAt.toISOString(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
