import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  CATEGORIES,
  UNITS,
  parsePrice,
  requireAdmin,
  toProduct,
} from "@/lib/catalogue";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/products
 * Same as the public list but requires auth (admin sees everything, even hidden ones).
 */
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await db.product.findMany({
    orderBy: [{ cat: "asc" }, { stock: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ items: rows.map(toProduct) });
}

type Patch = {
  id: number;
  name?: string;
  cat?: string;
  unit?: string;
  price?: number | null;
  mrp?: number | null;
  kn?: string;
  stock?: boolean;
  img?: string | null;
};

/**
 * PUT /api/admin/products
 * Body: { changes: Patch[] }
 * Applies partial updates to many products in a single transaction.
 * `price` and `mrp` may be null (= "price at store" / no discount badge).
 */
export async function PUT(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { changes?: Patch[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const changes = Array.isArray(body.changes) ? body.changes : [];
  if (changes.length === 0) {
    return NextResponse.json({ ok: true, updated: 0 });
  }

  // Validate every change before touching the DB.
  for (const c of changes) {
    if (!Number.isInteger(c.id) || c.id <= 0) {
      return NextResponse.json({ error: `Invalid id: ${c.id}` }, { status: 400 });
    }
    if (c.name !== undefined && (typeof c.name !== "string" || !c.name.trim())) {
      return NextResponse.json({ error: `Invalid name for id ${c.id}` }, { status: 400 });
    }
    if (c.cat !== undefined && !CATEGORIES.includes(c.cat as never)) {
      return NextResponse.json({ error: `Invalid category for id ${c.id}` }, { status: 400 });
    }
    if (c.unit !== undefined && !UNITS.includes(c.unit as never)) {
      return NextResponse.json({ error: `Invalid unit for id ${c.id}` }, { status: 400 });
    }
    if (c.price !== undefined && c.price !== null) {
      const p = parsePrice(c.price);
      if (p === null) {
        return NextResponse.json({ error: `Invalid price for id ${c.id}` }, { status: 400 });
      }
      c.price = p;
    }
    if (c.mrp !== undefined && c.mrp !== null) {
      const m = parsePrice(c.mrp);
      if (m === null) {
        return NextResponse.json({ error: `Invalid MRP for id ${c.id}` }, { status: 400 });
      }
      c.mrp = m;
    }
    if (c.kn !== undefined && typeof c.kn !== "string") {
      return NextResponse.json({ error: `Invalid Kannada name for id ${c.id}` }, { status: 400 });
    }
    if (c.stock !== undefined && typeof c.stock !== "boolean") {
      return NextResponse.json({ error: `Invalid stock flag for id ${c.id}` }, { status: 400 });
    }
    if (c.img !== undefined && c.img !== null && !/^\/api\/photos\/\d+(\?v=\d+)?$/.test(c.img)) {
      return NextResponse.json({ error: `Invalid photo for id ${c.id}` }, { status: 400 });
    }
  }

  await db.$transaction(
    changes.map((c) =>
      db.product.update({
        where: { id: c.id },
        data: {
          ...(c.name !== undefined ? { name: c.name.trim() } : {}),
          ...(c.cat !== undefined ? { cat: c.cat } : {}),
          ...(c.unit !== undefined ? { unit: c.unit } : {}),
          ...(c.price !== undefined ? { price: c.price } : {}),
          ...(c.mrp !== undefined ? { mrp: c.mrp } : {}),
          ...(c.kn !== undefined ? { kn: c.kn } : {}),
          ...(c.stock !== undefined ? { stock: c.stock } : {}),
          ...(c.img !== undefined ? { img: c.img } : {}),
        },
      }),
    ),
  );

  return NextResponse.json({ ok: true, updated: changes.length });
}

/**
 * POST /api/admin/products
 * Body: { id, name, cat, unit, price?, mrp?, kn?, stock?, img? }
 * Creates a brand-new product. The id (PLU) must be unique.
 */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    id?: number;
    name?: string;
    cat?: string;
    unit?: string;
    price?: number | null;
    mrp?: number | null;
    kn?: string;
    stock?: boolean;
    img?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!Number.isInteger(body.id) || body.id <= 0) {
    return NextResponse.json({ error: "Pick a positive whole-number PLU" }, { status: 400 });
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!body.cat || !CATEGORIES.includes(body.cat as never)) {
    return NextResponse.json({ error: "Pick a valid category" }, { status: 400 });
  }
  if (!body.unit || !UNITS.includes(body.unit as never)) {
    return NextResponse.json({ error: "Pick a valid unit" }, { status: 400 });
  }

  const existing = await db.product.findUnique({ where: { id: body.id } });
  if (existing) {
    return NextResponse.json({ error: `PLU ${body.id} is already in use` }, { status: 400 });
  }

  const created = await db.product.create({
    data: {
      id: body.id,
      name: body.name.trim(),
      cat: body.cat,
      unit: body.unit,
      price: parsePrice(body.price ?? null),
      mrp: parsePrice(body.mrp ?? null),
      kn: typeof body.kn === "string" ? body.kn : "",
      stock: body.stock !== false,
      img: typeof body.img === "string" ? body.img : null,
    },
  });

  return NextResponse.json({ ok: true, product: toProduct(created) });
}

/** Re-exported so the admin password is overridable from env without code changes. */
