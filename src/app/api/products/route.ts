import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { toProduct } from "@/lib/catalogue";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/products
 * Returns the entire catalogue, sorted by category then name, plus a `version`
 * timestamp (most recent updatedAt) so clients can detect changes.
 */
export async function GET() {
  const rows = await db.product.findMany({
    orderBy: [{ cat: "asc" }, { stock: "desc" }, { name: "asc" }],
  });

  const items = rows.map(toProduct);
  const version =
    rows.length > 0
      ? rows.reduce((m, r) => (r.updatedAt > m ? r.updatedAt : m), rows[0].updatedAt).toISOString()
      : new Date(0).toISOString();

  return NextResponse.json(
    { version, items },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
