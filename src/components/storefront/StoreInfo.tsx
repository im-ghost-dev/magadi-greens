"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Clock, ShoppingBag, Send } from "lucide-react";
import { toast } from "sonner";
import { mapEmbedSrc, type Settings } from "@/lib/settings";

export function StoreInfo({ settings }: { settings: Settings }) {
  const [sugg, setSugg] = useState("");
  const MAPS_URL = settings.mapsUrl;
  const STORE_WHATSAPP = settings.whatsapp;

  return (
    <section
      id="store"
      className="mt-9 scroll-mt-[116px] border-t border-border pt-8"
    >
      <div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
        {/* Visit the store */}
        <div className="rounded-[20px] border border-border bg-white p-5">
          <h2 className="mb-3 text-xl font-extrabold tracking-tight">Visit the store</h2>
          <div className="mb-3.5 grid gap-2 text-[14px] text-[#334236]">
            <span>
              <MapPin className="mr-1 inline size-4 text-g700" />
              {settings.address}
            </span>
            <span>
              <Clock className="mr-1 inline size-4 text-g700" />
              {settings.hours}
            </span>
            <span>
              <ShoppingBag className="mr-1 inline size-4 text-g700" />
              Send your list at least 20 minutes before you arrive so we can pack it.
            </span>
          </div>
          <iframe
            title="MAGADI GREENS on Google Maps"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-60 w-full rounded-[14px] border-0 bg-g50"
            src={mapEmbedSrc()}
          />
          <p className="mt-3">
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-g600 px-5 py-3 text-sm font-bold text-white hover:bg-g700"
            >
              <MapPin className="size-4" /> Get directions
            </a>
          </p>
        </div>

        {/* Reviews + suggestions */}
        <div className="grid gap-4">
          <div className="rounded-[20px] border border-border bg-white p-5">
            <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold">What customers say</h3>
                <span className="mt-0.5 flex items-center gap-2 text-amber">
                  <span className="tracking-[2px]">★★★★★</span>
                  <small className="text-mute">Google reviews</small>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-g600 bg-white px-3.5 py-2 text-[13px] font-semibold text-g700 hover:bg-g50"
                >
                  Read reviews
                </a>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border-[1.5px] border-g600 bg-white px-3.5 py-2 text-[13px] font-semibold text-g700 hover:bg-g50"
                >
                  Write a review
                </a>
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <div className="rounded-[14px] bg-cream p-3.5 text-[13px]">
                <span className="text-amber tracking-[2px]">★★★★★</span>
                <p className="my-1 text-[#334236]">
                  Super convenient. I send my list before leaving office and the bag is packed when I
                  reach.
                </p>
                <b className="text-[12px]">Ramesh K.</b>
              </div>
              <div className="rounded-[14px] bg-cream p-3.5 text-[13px]">
                <span className="text-amber tracking-[2px]">★★★★★</span>
                <p className="my-1 text-[#334236]">
                  I check today&apos;s soppu and vegetable rates from home. Always clean produce and
                  honest weights.
                </p>
                <b className="text-[12px]">Kavitha S.</b>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-border bg-white p-5">
            <h3 className="text-base font-bold">Want us to stock something?</h3>
            <p className="mt-0.5 text-[13px] text-mute">
              Tell us a fruit or vegetable you&apos;d like and we&apos;ll try to get it.
            </p>
            <div className="mt-2.5 flex gap-2">
              <Input
                value={sugg}
                onChange={(e) => setSugg(e.target.value)}
                placeholder="e.g. Baby corn"
                aria-label="Item request"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && sugg.trim()) {
                    window.open(
                      `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(
                        "*💡 Item request for MAGADI GREENS:*\n" + sugg.trim(),
                      )}`,
                      "_blank",
                      "noopener",
                    );
                    setSugg("");
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (!sugg.trim()) return;
                  window.open(
                    `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(
                      "*💡 Item request for MAGADI GREENS:*\n" + sugg.trim(),
                    )}`,
                    "_blank",
                    "noopener",
                  );
                  toast.success("Opening WhatsApp with your request…");
                  setSugg("");
                }}
                className="bg-g600 hover:bg-g700"
              >
                <Send className="size-4" /> Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
