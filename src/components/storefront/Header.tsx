"use client";

import { Settings, Search, ShoppingBag, Phone, MapPin } from "lucide-react";
import { telHref, type Settings as ShopSettings } from "@/lib/settings";

type Props = {
  cartCount: number;
  onOpenCart: () => void;
  search: string;
  onSearch: (v: string) => void;
  view: "store" | "admin";
  onSwitchView: (v: "store" | "admin") => void;
  adminStatus: "unknown" | "checking" | "authed" | "guest";
  settings: ShopSettings;
};

export function Header({
  cartCount,
  onOpenCart,
  search,
  onSearch,
  view,
  onSwitchView,
  adminStatus,
  settings,
}: Props) {
  return (
    <>
      {/* Announcement bar */}
      <div className="bg-g900 text-white">
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 py-2 text-[12.5px]">
          <span>
            <strong>Self pick-up only.</strong> Order online and we&apos;ll pack it fresh and keep
            it ready.
          </span>
          <a
            href={telHref(settings.phone)}
            className="underline underline-offset-2 hover:text-g100"
          >
            <Phone className="mr-1 inline size-3" />
            Call the store: {settings.phone}
          </a>
        </div>
      </div>

      {/* Sticky header */}
      <header
        id="mg-header"
        className="sticky top-0 z-30 border-b border-border bg-white"
      >
        <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-3 px-4 py-2.5">
          <a
            href="#top"
            className="mr-auto flex items-center gap-2.5"
            aria-label="MAGADI GREENS home"
            onClick={() => onSwitchView("store")}
          >
            <span className="grid size-10 place-items-center rounded-full bg-g900 text-xl">
              🌿
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-extrabold tracking-tight text-g900">
                {settings.shopName}
              </span>
              <span className="block text-[11px] font-medium text-mute">
                {settings.tagline}
              </span>
            </span>
          </a>

          {/* Search – drops below the logo on mobile */}
          <label className="order-3 w-full lg:order-none lg:w-[clamp(280px,40vw,520px)]">
            <span className="sr-only">Search products</span>
            <div className="relative">
              <input
                type="search"
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search carrot, palak, banana…"
                autoComplete="off"
                aria-label="Search products"
                className="w-full rounded-full border border-border bg-cream px-4 py-2.5 pr-12 text-sm outline-none focus:border-g600 focus:bg-white focus:ring-2 focus:ring-g100"
              />
              <span className="absolute right-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-g600 text-white">
                <Search className="size-4" strokeWidth={2.5} />
              </span>
            </div>
          </label>

          {settings.mapsUrl && (
            <a
              href={settings.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-border bg-cream px-3.5 py-2 text-[13px] font-semibold hover:bg-g50 md:inline-flex"
            >
              <MapPin className="size-4" /> Store location
            </a>
          )}

          <button
            onClick={() => onSwitchView(view === "admin" ? "store" : "admin")}
            aria-pressed={view === "admin"}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
              view === "admin"
                ? "border-g900 bg-g900 text-white"
                : "border-border bg-cream hover:bg-g50"
            }`}
            title="Admin"
          >
            <Settings className="size-4" />
            <span className="hidden sm:inline">
              {adminStatus === "authed" ? "Admin panel" : "Admin"}
            </span>
          </button>

          <button
            onClick={onOpenCart}
            aria-label="Open pick-up list"
            className="relative inline-flex items-center gap-1.5 rounded-full border border-g900 bg-g900 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-g700"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Pick-up list</span>
            <span
              id="mg-cart-badge"
              key={cartCount}
              className={`grid min-w-5 place-items-center rounded-full bg-badge px-1.5 text-[11px] font-bold text-white ${
                cartCount > 0 ? "mg-pop" : ""
              }`}
            >
              {cartCount}
            </span>
          </button>
        </div>
      </header>
    </>
  );
}
