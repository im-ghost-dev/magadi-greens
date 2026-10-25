"use client";

import type { Settings } from "@/lib/settings";

export function Hero({ settings }: { settings: Settings }) {
  return (
    <section className="mt-4 flex items-center justify-between gap-5 overflow-hidden rounded-3xl bg-g900 p-7 text-white">
      <div>
        <h1 className="max-w-[14ch] text-[clamp(26px,5vw,42px)] font-extrabold leading-[1.1] tracking-tight">
          Fresh from the farm, packed before you arrive.
        </h1>
        <p className="mt-3 max-w-[44ch] text-[15px] text-[#cfe5d0]">
          Pick your fruits and vegetables, send the list on WhatsApp, and collect from our counter
          without waiting.
        </p>
        <div className="mt-5 flex flex-wrap gap-2.5">
          <a href="#shop" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-g900 hover:bg-g50">
            Shop today&apos;s stock
          </a>
          <a
            href="#store"
            className="rounded-full border-[1.5px] border-[#6fae74] px-5 py-3 text-sm font-bold text-white hover:bg-g700"
          >
            Store timings &amp; map
          </a>
        </div>
        <div className="mt-3.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#cfe5d0]">
          <span>{settings.hours}</span>
          <span>Prices updated every morning</span>
        </div>
      </div>
      <div
        className="hidden text-right text-[clamp(64px,13vw,128px)] leading-none tracking-tighter select-none sm:block"
        aria-hidden
      >
        🥕🍅
      </div>
    </section>
  );
}
