/**
 * Shared server-side helpers: types, validation, auth.
 * Only ever imported from server code (API routes / server components).
 */
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const CATEGORIES = ["v", "l", "f", "m", "x", "o"] as const;
export type Category = (typeof CATEGORIES)[number];

export const UNITS = ["kg", "pc", "bunch", "pkt"] as const;
export type Unit = (typeof UNITS)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  v: "Vegetables",
  l: "Leafy greens",
  f: "Fruits",
  m: "Mangoes",
  x: "Exotic & imported",
  o: "Eggs & more",
};

export const CATEGORY_EMOJI: Record<string, string> = {
  v: "🥕",
  l: "🥬",
  f: "🍌",
  m: "🥭",
  x: "🥑",
  o: "🥚",
};

export const UNIT_LABELS: Record<string, string> = {
  kg: "per kg",
  pc: "each",
  bunch: "per bunch",
  pkt: "per packet",
};

export type Product = {
  id: number;
  name: string;
  cat: string;
  unit: string;
  price: number | null;
  mrp: number | null;
  kn: string;
  stock: boolean;
  img: string | null;
  updatedAt: string;
};

/** Convert a Prisma product row to the public Product shape. */
export function toProduct(row: {
  id: number;
  name: string;
  cat: string;
  unit: string;
  price: number | null;
  mrp: number | null;
  kn: string;
  stock: boolean;
  img: string | null;
  updatedAt: Date;
}): Product {
  return {
    id: row.id,
    name: row.name,
    cat: row.cat,
    unit: row.unit,
    price: row.price,
    mrp: row.mrp,
    kn: row.kn,
    stock: row.stock,
    img: row.img
      ? row.img.replace(/^\/images\/products\/(\d+)\.jpg(\?v=\d+)?$/, "/api/photos/$1$2")
      : null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Validates and cleans a price/mrp input. Returns null for empty / invalid. */
export function parsePrice(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  if (!isFinite(n) || n < 0 || n > 100000) return null;
  return Math.round(n * 100) / 100;
}

/** Admin auth: the shared password comes ONLY from the ADMIN_PASSWORD environment variable. */
export function getAdminPassword(): string | null {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length >= 8 ? p : null;
}
export const ADMIN_COOKIE = "mg_admin_token";

/** Validate the admin session token from the cookie. */
export async function requireAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const session = await db.adminSession.findUnique({ where: { token } });
  if (!session) return false;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.adminSession.delete({ where: { token } }).catch(() => {});
    return false;
  }
  return true;
}

/** Map a product name to a sensible produce emoji (used when no photo). */
export function emojiFor(name: string, cat: string): string {
  const rules: [RegExp, string][] = [
    [/custard/i, "🍏"],
    [/banana flower/i, "🌺"],
    [/banana stem/i, "🌴"],
    [/banana/i, "🍌"],
    [/mango/i, "🥭"],
    [/coconut/i, "🥥"],
    [/pineapple/i, "🍍"],
    [/grape/i, "🍇"],
    [/watermelon/i, "🍉"],
    [/melon|papaya/i, "🍈"],
    [/strawberry/i, "🍓"],
    [/kiwi/i, "🥝"],
    [/orange|mosambi/i, "🍊"],
    [/lemon/i, "🍋"],
    [/pear|persimmon/i, "🍐"],
    [/plum|ber /i, "🍑"],
    [/avocado/i, "🥑"],
    [/lychee|rambutan|litius/i, "🍒"],
    [/apple/i, "🍎"],
    [/tomato/i, "🍅"],
    [/carrot/i, "🥕"],
    [/sweet potato/i, "🍠"],
    [/potato|yam|tapioca|koorka|chena/i, "🥔"],
    [/onion/i, "🧅"],
    [/garlic/i, "🧄"],
    [/ginger|turmeric/i, "🫚"],
    [/chilli/i, "🌶️"],
    [/capsicum/i, "🫑"],
    [/brinjal/i, "🍆"],
    [/cucumber/i, "🥒"],
    [/corn/i, "🌽"],
    [/peas|beans|avarekai|togarikai|gorikai/i, "🫛"],
    [/mushroom/i, "🍄"],
    [/broccoli/i, "🥦"],
    [/cabbage|lettuce/i, "🥬"],
    [/pumpkin/i, "🎃"],
    [/egg/i, "🥚"],
    [/sugar cane/i, "🎋"],
  ];
  const fallback: Record<string, string> = { v: "🥦", l: "🌿", f: "🍎", m: "🥭", x: "🍈", o: "🥚" };
  return (rules.find(([re]) => re.test(name)) || [null, fallback[cat] || "🥬"])[1];
}
