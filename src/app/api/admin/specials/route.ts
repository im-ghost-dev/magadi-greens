import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

const MAX_SLOTS = 6;

const str = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

/** GET /api/admin/specials (auth) – full list for the admin editor. */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.special.findMany({
    orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ items: rows });
}

/**
 * POST /api/admin/specials (auth) – create a new slot.
 * Body: { productId?, title?, priceText?, label? }
 * Enforces the 1–6 limit (max 6).
 */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await db.special.count();
  if (count >= MAX_SLOTS) {
    return NextResponse.json(
      { error: `You can have at most ${MAX_SLOTS} Today's Special slots.` },
      { status: 400 },
    );
  }

  let body: {
    productId?: number | null;
    title?: string;
    priceText?: string;
    label?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const productId =
    body.productId != null && Number.isInteger(body.productId) ? body.productId : null;
  const title = str(body.title, 80);
  const priceText = str(body.priceText, 40);
  const label = str(body.label, 40);

  // A slot must have either a linked product or a custom title.
  if (productId == null && !title) {
    return NextResponse.json(
      { error: "Pick a product or enter a custom title." },
      { status: 400 },
    );
  }

  const max = await db.special.aggregate({ _max: { sort: true } });
  const sort = (max._max.sort ?? -1) + 1;

  const created = await db.special.create({
    data: { productId, title, priceText, label, sort },
  });
  return NextResponse.json({ ok: true, special: created });
}

/**
 * PUT /api/admin/specials (auth) – bulk update existing slots.
 * Body: { items: { id, productId?, title?, priceText?, label?, sort? }[] }
 */
export async function PUT(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    items?: {
      id: string;
      productId?: number | null;
      title?: string;
      priceText?: string;
      label?: string;
      sort?: number;
    }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const items = Array.isArray(body.items) ? body.items : [];
  if (!items.length) return NextResponse.json({ ok: true, updated: 0 });

  for (const it of items) {
    if (typeof it.id !== "string" || !it.id) {
      return NextResponse.json({ error: "Invalid slot id" }, { status: 400 });
    }
  }

  await db.$transaction(
    items.map((it) =>
      db.special.update({
        where: { id: it.id },
        data: {
          ...(it.productId !== undefined
            ? { productId: it.productId == null ? null : Number(it.productId) }
            : {}),
          ...(it.title !== undefined ? { title: str(it.title, 80) } : {}),
          ...(it.priceText !== undefined ? { priceText: str(it.priceText, 40) } : {}),
          ...(it.label !== undefined ? { label: str(it.label, 40) } : {}),
          ...(it.sort !== undefined && Number.isInteger(it.sort) ? { sort: it.sort } : {}),
        },
      }),
    ),
  );

  return NextResponse.json({ ok: true, updated: items.length });
}
