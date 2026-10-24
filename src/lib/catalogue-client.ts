"use client";

/** Shared client-side catalogue helpers (no server-only imports here). */

export const CATEGORIES: [string, string][] = [
  ["all", "🧺 All items"],
  ["v", "🥕 Vegetables"],
  ["l", "🥬 Leafy greens"],
  ["f", "🍌 Fruits"],
  ["m", "🥭 Mangoes"],
  ["x", "🥑 Exotic & imported"],
  ["o", "🥚 Eggs & more"],
];

export const CATEGORY_LABEL: Record<string, string> = {
  v: "Vegetables",
  l: "Leafy greens",
  f: "Fruits",
  m: "Mangoes",
  x: "Exotic & imported",
  o: "Eggs & more",
};

export const UNIT_INFO: Record<
  string,
  { step: number; per: string; max: number }
> = {
  kg: { step: 0.25, per: "per kg", max: 25 },
  pc: { step: 1, per: "each", max: 50 },
  bunch: { step: 1, per: "per bunch", max: 50 },
  pkt: { step: 1, per: "per packet", max: 50 },
};

export const CAT_RANK: Record<string, number> = { v: 0, l: 1, f: 2, m: 3, x: 4, o: 5 };

/** Product shape used across the app (matches the API response). */
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

const round2 = (n: number) => Math.round(n * 100) / 100;
export const rupee = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const stepOf = (p: Product) => UNIT_INFO[p.unit]?.step ?? 1;
export const maxOf = (p: Product) => UNIT_INFO[p.unit]?.max ?? 50;

export const hasDeal = (p: Product) =>
  p.price != null && p.mrp != null && p.mrp > p.price;

export const pct = (p: Product) =>
  hasDeal(p) ? Math.round((1 - (p.price as number) / (p.mrp as number)) * 100) : 0;

/** Discount % derived from a price/mrp pair (admin editing). */
export const discOf = (
  price: number | null,
  mrp: number | null,
): number | null => {
  if (mrp == null || price == null || mrp <= price) return null;
  return Math.round((1 - price / mrp) * 1000) / 10;
};

export function fmtQty(p: Product, q: number): string {
  if (p.unit === "kg") return q < 1 ? Math.round(q * 1000) + " g" : q + " kg";
  if (p.unit === "bunch") return q + (q > 1 ? " bunches" : " bunch");
  return q + (p.unit === "pkt" ? " pkt" : " pc");
}

export const itemCount = (cart: Record<number, number>) =>
  Object.keys(cart).length;

export function totals(
  products: Product[],
  cart: Record<number, number>,
): { sum: number; ask: number } {
  let sum = 0;
  let ask = 0;
  for (const p of products) {
    const q = cart[p.id];
    if (!q) continue;
    if (p.price == null) ask++;
    else sum += p.price * q;
  }
  return { sum: round2(sum), ask };
}

export function totalText(
  products: Product[],
  cart: Record<number, number>,
): string {
  const t = totals(products, cart);
  if (!t.ask) return rupee(t.sum);
  return t.sum ? rupee(t.sum) + " + store-priced items" : "Price at store";
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
