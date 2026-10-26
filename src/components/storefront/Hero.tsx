"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Sparkles, Sprout } from "lucide-react";
import type { ShopSettings } from "@/types";

export function Hero({ settings }: { settings: ShopSettings | null }) {
  function scrollToMenu() {
    const el = document.getElementById("menu");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function scrollToStore() {
    const el = document.getElementById("store");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const rawHours = settings?.hours?.trim();
  const hoursDisplay = rawHours
    ? rawHours.toLowerCase().startsWith("open")
      ? rawHours
      : `Open ${rawHours.toLowerCase().startsWith("daily") ? rawHours.toLowerCase() : `daily ${rawHours}`}`
    : "Open daily 6:30 AM – 9:30 PM";

  return (
    <section className="mx-auto max-w-6xl px-4 pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-primary-deep shadow-lift">
        <motion.img
          initial={{ scale: 1.06, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          src="/images/hero.jpg"
          alt="Crate of fresh vegetables and fruits"
          width={1600}
          height={912}
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex min-h-[220px] flex-col justify-end gap-3 p-5 sm:min-h-[280px] sm:p-10"
        >
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
            <Sprout className="h-3.5 w-3.5" /> {settings?.tagline ?? "Farm fresh · Self pick-up"}
          </span>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={scrollToMenu}
              className="flex h-11 min-h-[44px] items-center justify-center rounded-full bg-white px-5 text-sm font-bold text-primary-deep shadow-md transition hover:bg-white/95 active:scale-95 cursor-pointer"
            >
              Shop today&apos;s stock
            </button>
            <button
              type="button"
              onClick={scrollToStore}
              className="flex h-11 min-h-[44px] items-center justify-center rounded-full border border-white/60 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95 cursor-pointer"
            >
              <MapPin className="h-4 w-4 mr-1 text-white/90" />
              Store timings &amp; map
            </button>
          </div>

          {/* Info Lines */}
          <div className="flex flex-col gap-1 text-xs sm:text-sm text-primary-foreground/90 pt-0.5">
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-white/80" />
              <span>{hoursDisplay}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-white/80" />
              <span>Prices updated every morning</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
