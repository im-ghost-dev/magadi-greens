"use client";

import { emojiFor, fmtQty, hasDeal, pct, rupee, stepOf, maxOf, UNIT_INFO, type Product } from "@/lib/catalogue-client";
import { useCart } from "@/store/useCart";
import { Minus, Plus } from "lucide-react";

export function ProductCard({ p }: { p: Product }) {
  const cart = useCart((s) => s.cart);
  const add = useCart((s) => s.add);
  const sub = useCart((s) => s.sub);
  const qty = cart[p.id] ?? 0;
  const deal = hasDeal(p);

  return (
    <article
      className={`flex flex-col rounded-2xl border border-border bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-g900/10 ${
        p.stock ? "" : "opacity-65"
      }`}
    >
      <div className="relative grid h-[110px] place-items-center overflow-hidden rounded-xl bg-g50 text-[56px]">
        {deal && (
          <span className="absolute left-2 top-2 rounded-full bg-badge px-2 py-0.5 text-[11px] font-bold text-white">
            {pct(p)}% off
          </span>
        )}
        {!p.stock && (
          <span className="absolute right-2 top-2 rounded-full bg-[#fde4e4] px-2 py-0.5 text-[11px] font-bold text-[#b42318]">
            Out of stock
          </span>
        )}
        {p.img ? (
          <img
            src={p.img}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              const span = document.createElement("span");
              span.textContent = emojiFor(p.name, p.cat);
              img.replaceWith(span);
            }}
          />
        ) : (
          <span>{emojiFor(p.name, p.cat)}</span>
        )}
      </div>

      <div className="mt-2.5 text-[11.5px] text-mute">{p.kn || "\u00A0"}</div>
      <h3 className="min-h-[36px] text-[14px] font-bold leading-snug">{p.name}</h3>

      <div className="my-2.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        {p.price == null ? (
          <>
            <b className="text-[13.5px] font-bold text-mute">Price at store</b>
            <span className="ml-auto rounded-full bg-cream px-2 py-0.5 text-[11.5px] font-semibold text-mute">
              {UNIT_INFO[p.unit]?.per}
            </span>
          </>
        ) : (
          <>
            <b className="text-[17px] font-extrabold text-g700">{rupee(p.price)}</b>
            {deal && <s className="text-[12px] text-mute">{rupee(p.mrp as number)}</s>}
            <span className="ml-auto rounded-full bg-cream px-2 py-0.5 text-[11.5px] font-semibold text-mute">
              {UNIT_INFO[p.unit]?.per}
            </span>
          </>
        )}
      </div>

      <div className="mt-auto h-10">
        {!p.stock ? (
          <button
            disabled
            className="h-10 w-full cursor-not-allowed rounded-xl bg-[#e9ece9] text-sm font-bold text-[#9aa59c]"
          >
            Sold out today
          </button>
        ) : qty > 0 ? (
          <div className="flex h-10 items-center justify-between overflow-hidden rounded-xl border-[1.5px] border-g600 bg-g50">
            <button
              onClick={() => sub(p.id, stepOf(p))}
              aria-label={`Remove one ${p.name}`}
              className="grid h-full w-11 place-items-center text-xl font-bold text-g700 hover:bg-g100"
            >
              <Minus className="size-4" strokeWidth={3} />
            </button>
            <span aria-live="polite" className="text-[15px] font-extrabold">
              {fmtQty(p, qty)}
            </span>
            <button
              onClick={() => add(p.id, stepOf(p), maxOf(p))}
              aria-label={`Add one ${p.name}`}
              className="grid h-full w-11 place-items-center text-xl font-bold text-g700 hover:bg-g100"
            >
              <Plus className="size-4" strokeWidth={3} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => add(p.id, stepOf(p), maxOf(p))}
            aria-label={`Add ${p.name}`}
            className="h-10 w-full rounded-xl bg-g600 text-sm font-bold text-white transition-colors hover:bg-g700 active:scale-[.97]"
          >
            Add
          </button>
        )}
      </div>
    </article>
  );
}
