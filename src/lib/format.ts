import type { CartLine, Product, ShopSettings, Unit } from "@/types";

export const rupee = (n: number) =>
  `₹${Number.isInteger(n) ? n : n.toFixed(2).replace(/\.?0+$/, "")}`;

/** kg steps in 250 g; everything else in whole numbers */
export const stepFor = (unit: Unit) => (unit === "kg" ? 0.25 : 1);

export function formatQty(qty: number, unit: Unit): string {
  if (unit === "kg") return qty < 1 ? `${Math.round(qty * 1000)} g` : `${+qty.toFixed(2)} kg`;
  return `${qty} ${unit}`;
}

export const unitPrice = (price: number, unit: Unit) => `${rupee(price)} / ${unit}`;

export const calcPrice = (mrp: number, discount: number) =>
  Math.round(mrp * (1 - Math.min(100, Math.max(0, discount)) / 100));

export const calcDiscount = (mrp: number, price: number) =>
  mrp > 0 ? Math.max(0, Math.round((1 - price / mrp) * 100)) : 0;

export const lineTotal = (price: number | null, qty: number) =>
  price == null ? null : Math.round(price * qty * 100) / 100;

export function estimate(lines: { price: number | null; qty: number }[]) {
  let total = 0;
  let storePriced = 0;
  for (const l of lines) {
    if (l.price == null) storePriced++;
    else total += l.price * l.qty;
  }
  return { total: Math.round(total * 100) / 100, storePriced };
}

export function buildWhatsAppMessage(args: {
  settings: ShopSettings;
  name: string;
  phone: string;
  time: string;
  items: { product: Product; line: CartLine }[];
}) {
  const { settings, name, phone, time, items } = args;
  const est = estimate(items.map((i) => ({ price: i.product.price, qty: i.line.qty })));
  const rows = items.map(({ product, line }, idx) => {
    const t = lineTotal(product.price, line.qty);
    return `${idx + 1}. ${product.name} (PLU ${product.plu}) — ${formatQty(line.qty, product.unit)}${
      t == null ? " (price at store)" : ` — ${rupee(t)}`
    }`;
  });
  const totalTxt =
    rupee(est.total) + (est.storePriced ? ` + ${est.storePriced} store-priced item(s)` : "");
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
    est.storePriced > 0 ? `(Items marked "price at store" are weighed and priced at the counter.)` : ``,
  ]
    .filter((l) => l !== "")
    .join("\n");
}

export const whatsappUrl = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
