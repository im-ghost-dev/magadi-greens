export type Category =
  | "Vegetables"
  | "Leafy"
  | "Fruits"
  | "Mangoes"
  | "Exotic"
  | "Eggs & more";

export type Unit = "kg" | "pc" | "bunch" | "pkt";

export const CATEGORIES: Category[] = [
  "Vegetables",
  "Leafy",
  "Fruits",
  "Mangoes",
  "Exotic",
  "Eggs & more",
];

export const UNITS: Unit[] = ["kg", "pc", "bunch", "pkt"];

export const CAT_TO_CODE: Record<Category, string> = {
  Vegetables: "v",
  Leafy: "l",
  Fruits: "f",
  Mangoes: "m",
  Exotic: "x",
  "Eggs & more": "o",
};

export const CODE_TO_CAT: Record<string, Category> = {
  v: "Vegetables",
  l: "Leafy",
  f: "Fruits",
  m: "Mangoes",
  x: "Exotic",
  o: "Eggs & more",
};

export interface Product {
  id: string;
  plu: string;
  name: string;
  kn?: string;
  category: Category;
  unit: Unit;
  mrp: number | null;
  discount: number; // percent 0-100
  price: number | null; // null = "Price at store"
  inStock: boolean;
  image?: string | null;
}

export interface Special {
  id: string;
  productId?: string | null;
  title: string;
  price: number | null;
  priceText: string;
  image?: string | null;
  label: string;
  sort?: number;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  phone: string;
  whatsapp: string; // digits incl. country code, e.g. 919876543210
  address: string;
  hours: string;
  mapsUrl: string;
}

export interface CartLine {
  productId: string;
  qty: number;
  /** price seen when added / last recalculated, used to detect changes */
  priceSnapshot: number | null;
}
