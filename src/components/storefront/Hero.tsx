"use client";

import { motion } from "framer-motion";
import { MapPin, Sprout } from "lucide-react";
import type { ShopSettings } from "@/types";

export function Hero({ settings }: { settings: ShopSettings | null }) {
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
          className="relative flex min-h-[200px] flex-col justify-end gap-2 p-5 sm:min-h-[280px] sm:p-10"
        >
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium text-primary-foreground backdrop-blur">
            <Sprout className="h-3.5 w-3.5" /> {settings?.tagline ?? "Farm fresh · Self pick-up"}
          </span>
          <h1 className="max-w-md text-3xl font-bold leading-tight text-primary-foreground sm:text-5xl">
            Picked this morning. Ready when you are.
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
            <MapPin className="h-4 w-4" /> Build your list, collect at the store.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
