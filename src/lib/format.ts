import type { CartLine, Product, ShopSettings, Unit } from "@/types";

/** Strips currency symbols and whitespace, returning a clean float or null. */
export function parsePrice(val: unknown): number | null {
  if (val == null) return null;
  if (typeof val === "number") return Number.isFinite(val) ? val : null;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^\d.]/g, "").trim();
    if (!cleaned) return null;
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

export const rupee = (n: number | null | undefined) => {
  const num = parsePrice(n);
  if (num == null) return "₹0";
  return `₹${Number.isInteger(num) ? num : num.toFixed(2).replace(/\.?0+$/, "")}`;
};

/** kg steps in 250 g (0.25 kg); everything else in whole numbers */
export const stepFor = (unit: Unit) => (unit === "kg" ? 0.25 : 1);

export function formatQty(qty: number, unit: Unit): string {
  if (unit === "kg") {
    return qty < 1 ? `${Math.round(qty * 1000)} g` : `${+qty.toFixed(2)} kg`;
  }
  return `${qty} ${unit}`;
}

export const unitPrice = (price: unknown, unit: Unit) => {
  const p = parsePrice(price);
  return p == null ? "Price at store" : `${rupee(p)} / ${unit}`;
};

export const calcPrice = (mrp: number, discount: number) =>
  Math.round(mrp * (1 - Math.min(100, Math.max(0, discount)) / 100));

export const calcDiscount = (mrp: number, price: number) =>
  mrp > 0 ? Math.max(0, Math.round((1 - price / mrp) * 100)) : 0;

/**
 * Calculates item subtotal proportionally based on unit:
 * - Weight-based (kg): (pricePerKg / 1000) * grams = pricePerKg * qtyInKg
 * - Unit / packet (pkt, pc, bunch): unitPrice * qty
 */
export function lineTotal(price: unknown, qty: number, unit?: Unit): number | null {
  const p = parsePrice(price);
  if (p == null) return null;
  const total = p * qty;
  return Math.round(total * 100) / 100;
}

export interface EstimateResult {
  total: number;
  hasPriced: boolean;
  storePriced: number;
}

/**
 * Accurately sums all priced items in the cart and tracks store-priced (unpriced) items.
 */
export function estimate(
  lines: { price: unknown; qty: number; unit?: Unit }[],
): EstimateResult {
  let total = 0;
  let storePriced = 0;
  let pricedCount = 0;

  for (const l of lines) {
    const sub = lineTotal(l.price, l.qty, l.unit);
    if (sub == null) {
      storePriced++;
    } else {
      pricedCount++;
      total += sub;
    }
  }

  const rounded = Math.round(total * 100) / 100;
  return {
    total: rounded,
    hasPriced: pricedCount > 0,
    storePriced,
  };
}

export function buildWhatsAppMessage(args: {
  settings: ShopSettings;
  name: string;
  phone: string;
  time: string;
  items: { product: Product; line: CartLine }[];
}) {
  const { settings, name, phone, time, items } = args;
  const est = estimate(
    items.map((i) => ({
      price: i.product.price,
      qty: i.line.qty,
      unit: i.product.unit,
    })),
  );

  const rows = items.map(({ product, line }, idx) => {
    const t = lineTotal(product.price, line.qty, product.unit);
    return `${idx + 1}. ${product.name} (PLU ${product.plu}) — ${formatQty(line.qty, product.unit)}${
      t == null ? " (price at store)" : ` — ${rupee(t)}`
    }`;
  });

  let totalTxt = rupee(est.total);
  if (est.storePriced > 0) {
    totalTxt += ` + ${est.storePriced} store-priced item(s)`;
  }

  return [
    `*🌿 Pick-up order — ${settings.shopName}*`,
    ``,
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Pick-up: ${time}`,
    ``,
    `*Order:*`,
    ...rows,
    ``,
    `*Estimated total: ${totalTxt}*`,
    est.storePriced > 0
      ? `(Items marked "price at store" are weighed and priced at the counter.)`
      : ``,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export const whatsappUrl = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
