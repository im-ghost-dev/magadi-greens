import {
  type Category,
  type Product,
  type ShopSettings,
  type Special,
  type Unit,
  CAT_TO_CODE,
  CODE_TO_CAT,
} from "@/types";
import { compressToWebp } from "./image-compress";
import { getProductImageUrl } from "./product-images";

/* ------------------------------- Products ------------------------------- */

interface RawProduct {
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
}

function mapProduct(p: RawProduct): Product {
  const mrp = p.mrp ?? null;
  const price = p.price ?? null;
  const discount =
    mrp != null && price != null && mrp > price
      ? Math.round(((mrp - price) / mrp) * 100)
      : 0;

  return {
    id: String(p.id),
    plu: String(p.id),
    name: p.name,
    kn: p.kn || "",
    category: (CODE_TO_CAT[p.cat] || "Vegetables") as Category,
    unit: p.unit as Unit,
    mrp,
    discount,
    price,
    inStock: p.stock !== false,
    image: p.img || getProductImageUrl(p.name, p.cat),
  };
}

/** GET /api/products — returns the full catalogue from the real database. */
export async function getProducts(): Promise<Product[]> {
  const res = await fetch("/api/products", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load products");
  const data = (await res.json()) as { items: RawProduct[] };
  return (data.items || []).map(mapProduct);
}

/** PUT /api/admin/products — update one product (admin only). */
export async function saveProduct(p: Product): Promise<Product> {
  const id = Number(p.id);
  const cat = CAT_TO_CODE[p.category] || "v";
  const res = await fetch("/api/admin/products", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      changes: [
        {
          id,
          name: p.name,
          cat,
          unit: p.unit,
          price: p.price,
          mrp: p.mrp,
          stock: p.inStock,
          img: p.image ?? null,
          kn: p.kn,
        },
      ],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save product");
  }
  return p;
}

/** PUT /api/admin/products — update multiple products in bulk. */
export async function saveProducts(items: Product[]): Promise<void> {
  if (items.length === 0) return;
  const changes = items.map((p) => ({
    id: Number(p.id),
    name: p.name,
    cat: CAT_TO_CODE[p.category] || "v",
    unit: p.unit,
    price: p.price,
    mrp: p.mrp,
    stock: p.inStock,
    img: p.image ?? null,
    kn: p.kn,
  }));
  const res = await fetch("/api/admin/products", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ changes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save products");
  }
}

/** POST /api/admin/products — create a new product. */
export async function addProduct(p: Omit<Product, "id">): Promise<Product> {
  let id = Number(p.plu);
  if (!Number.isInteger(id) || id <= 0) {
    id = Math.floor(1000 + Math.random() * 9000);
  }
  const cat = CAT_TO_CODE[p.category] || "v";
  const res = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      name: p.name,
      cat,
      unit: p.unit,
      price: p.price,
      mrp: p.mrp,
      stock: p.inStock,
      img: p.image ?? null,
      kn: p.kn || "",
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add product");
  }
  const data = (await res.json()) as { product: RawProduct };
  return mapProduct(data.product);
}

/** DELETE /api/admin/products/:id — delete a product. */
export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete product");
  }
}

/** Photo upload for products or specials using canvas WebP compression. */
export async function uploadImage(file: File, targetId?: string): Promise<string> {
  const webp = await compressToWebp(file, 800);
  const fd = new FormData();
  fd.append("file", webp, webp.name);

  // If a numeric product id was provided, upload to product photo endpoint
  if (targetId && !isNaN(Number(targetId))) {
    fd.append("id", String(targetId));
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Photo upload failed");
    }
    const data = await res.json();
    return data.img;
  }

  // Fallback: create an object URL for preview before product creation
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(webp);
  });
}

/* ------------------------------- Specials ------------------------------- */

interface RawSpecial {
  id: string;
  productId: number | null;
  title: string;
  priceText: string;
  label: string;
  img: string | null;
  sort: number;
}

/** GET /api/specials — public list of specials. */
export async function getSpecials(): Promise<Special[]> {
  const res = await fetch("/api/specials", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load specials");
  const data = (await res.json()) as { items: RawSpecial[] };
  return (data.items || []).map((s) => {
    const numPrice = s.priceText ? parseFloat(s.priceText.replace(/[^\d.]/g, "")) : null;
    return {
      id: s.id,
      productId: s.productId != null ? String(s.productId) : null,
      title: s.title,
      price: !isNaN(numPrice as number) ? numPrice : null,
      priceText: s.priceText,
      image: s.img,
      label: s.label || "Fresh today",
      sort: s.sort,
    };
  });
}

/** PUT /api/admin/specials — replace/update specials slots (max 6). */
export async function saveSpecials(list: Special[]): Promise<Special[]> {
  const trimmed = list.slice(0, 6);
  const items = trimmed.map((s, idx) => ({
    id: s.id,
    productId: s.productId ? Number(s.productId) : null,
    title: s.title,
    priceText: s.priceText || (s.price != null ? `₹${s.price}` : ""),
    label: s.label,
    sort: idx,
  }));
  const res = await fetch("/api/admin/specials", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save specials");
  }
  return trimmed;
}

/** POST /api/admin/specials — add new special slot. */
export async function addSpecialSlot(slot: {
  productId?: number | null;
  title: string;
  priceText: string;
  label: string;
}): Promise<Special> {
  const res = await fetch("/api/admin/specials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(slot),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to add special slot");
  }
  const data = (await res.json()) as { special: RawSpecial };
  const s = data.special;
  return {
    id: s.id,
    productId: s.productId != null ? String(s.productId) : null,
    title: s.title,
    price: s.priceText ? parseFloat(s.priceText.replace(/[^\d.]/g, "")) : null,
    priceText: s.priceText,
    image: s.img,
    label: s.label,
    sort: s.sort,
  };
}

/** DELETE /api/admin/specials/:id — remove a slot. */
export async function deleteSpecialSlot(id: string): Promise<void> {
  const res = await fetch(`/api/admin/specials/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete special slot");
  }
}

/** Upload photo specifically for a special slot. */
export async function uploadSpecialImage(id: string, file: File): Promise<string> {
  const webp = await compressToWebp(file, 800);
  const fd = new FormData();
  fd.append("file", webp, `${id}.webp`);
  fd.append("id", id);
  const res = await fetch("/api/admin/specials/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload image");
  }
  const data = await res.json();
  return data.img;
}

/* ------------------------------- Settings ------------------------------- */

/** GET /api/settings — public shop info. */
export async function getSettings(): Promise<ShopSettings> {
  const res = await fetch("/api/settings", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

/** PUT /api/admin/settings — update shop info. */
export async function saveSettings(s: ShopSettings): Promise<ShopSettings> {
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(s),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to save settings");
  }
  const data = (await res.json()) as { settings: ShopSettings };
  return data.settings;
}

/* --------------------------------- Auth --------------------------------- */

/** POST /api/admin/login — authenticates against server ADMIN_PASSWORD. */
export async function adminLogin(password: string, staySignedIn = false): Promise<boolean> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, remember: staySignedIn }),
  });
  return res.ok;
}

/** DELETE /api/admin/login — invalidates session cookie on the server. */
export async function adminLogout(): Promise<void> {
  await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
}

/** GET /api/admin/login — verifies session cookie on the server. */
export async function isAdmin(): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/login", { cache: "no-store" });
    if (!res.ok) return false;
    const data = await res.json();
    return !!data.ok;
  } catch {
    return false;
  }
}
