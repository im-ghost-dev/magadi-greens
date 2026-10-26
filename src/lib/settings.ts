/** Shared shop-settings type + helpers (safe to import from client or server). */

export type Settings = {
  shopName: string;
  tagline: string;
  phone: string;
  /** Destination WhatsApp number for orders (digits only, incl. country code). */
  whatsapp: string;
  address: string;
  hours: string;
  mapsUrl: string;
  bannerText?: string | null;
  reviewsUrl?: string | null;
  updatedAt: string;
};

/** Defaults used before settings have loaded (and as a safety net). */
export const DEFAULT_SETTINGS: Settings = {
  shopName: "MAGADI GREENS",
  tagline: "Farm fresh · Self pick-up",
  phone: "+91 91481 12233",
  whatsapp: "919148112233",
  address:
    "No. 24, 20th Main Rd, Ittamadu, AGS Layout, Hosakerehalli, Bengaluru 560061",
  hours: "Daily 6:30 AM – 9:30 PM",
  mapsUrl: "https://maps.app.goo.gl/QN1YNYLwVPgDgvW86",
  bannerText: "Self pick-up only. Order online and we'll pack it fresh and keep it ready.",
  reviewsUrl: "",
  updatedAt: new Date(0).toISOString(),
};

/** Normalise a WhatsApp number to digits only (country code + number). */
export function cleanWhatsApp(v: string): string {
  return (v || "").replace(/\D/g, "");
}

/** A tel: href from a free-text phone string. */
export function telHref(phone: string): string {
  const d = phone.replace(/[^\d+]/g, "");
  return `tel:${d}`;
}
