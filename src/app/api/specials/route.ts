import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/specials
 * Public list of "Today's Special" slots, ordered for the carousel.
 * When there are none, returns an empty array and the storefront hides the
 * whole section.
 */
export async function GET() {
  const rows = await db.special.findMany({
    orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
  });
  const items = rows.map((s) => ({
    id: s.id,
    productId: s.productId,
    title: s.title,
    priceText: s.priceText,
    label: s.label,
    img: s.img,
    sort: s.sort,
  }));
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
