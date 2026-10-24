import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** GET /api/products/version – returns the most recent updatedAt, for cheap polling. */
export async function GET() {
  const latest = await db.product.aggregate({
    _max: { updatedAt: true },
    _count: { _all: true },
  });
  return NextResponse.json(
    {
      version: latest._max.updatedAt?.toISOString() ?? new Date(0).toISOString(),
      count: latest._count._all,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
