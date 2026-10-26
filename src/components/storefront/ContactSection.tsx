"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Clock, MapPin, MessageCircle, Navigation, Phone, ShoppingBag } from "lucide-react";
import type { ShopSettings } from "@/types";
import { Logo } from "@/components/ui/Logo";
import { whatsappUrl } from "@/lib/format";
import { mapEmbedSrc, telHref } from "@/lib/settings";

export function ContactSection({ settings }: { settings: ShopSettings }) {
  const shouldReduceMotion = useReducedMotion();

  const embedUrl = mapEmbedSrc();
  const reviewsLink = settings.reviewsUrl?.trim();

  return (
    <motion.section
      id="store"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card p-5 sm:p-8 shadow-card text-card-foreground scroll-mt-20"
      aria-label="Visit the store"
    >
      {/* Brand Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5">
        <div>
          <div className="rounded-xl bg-card border border-border/60 p-2 inline-block">
            <Logo name={settings.shopName} compact />
          </div>
          {settings.tagline && (
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">{settings.tagline}</p>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Left Column: Store Details & Notes */}
        <div className="flex flex-col justify-between gap-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Visit the store
            </h2>

            <ul className="mt-4 space-y-3.5 text-sm text-foreground/90">
              {settings.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.hours && (
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <span>{settings.hours}</span>
                </li>
              )}
              <li className="flex items-start gap-3 text-muted-foreground">
                <ShoppingBag className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <span>Send your list at least 20 minutes before you arrive so we can pack it.</span>
              </li>
              {settings.phone && (
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                  <a
                    href={telHref(settings.phone)}
                    className="underline-offset-4 hover:underline font-medium text-foreground"
                  >
                    {settings.phone}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Action Links & Review Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {settings.mapsUrl && (
                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary-deep active:scale-95 transition cursor-pointer"
                >
                  <MapPin className="h-4 w-4" /> Get directions
                </a>
              )}
              {settings.mapsUrl && (
                <a
                  href={settings.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground hover:bg-secondary active:scale-95 transition cursor-pointer"
                >
                  <Navigation className="h-4 w-4 text-primary" /> Open in Maps
                </a>
              )}
              {settings.whatsapp && (
                <a
                  href={whatsappUrl(settings.whatsapp, `Hi ${settings.shopName}!`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-semibold text-whatsapp-foreground hover:brightness-105 active:scale-95 transition cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp us
                </a>
              )}
            </div>

            {/* Optional Google Reviews Buttons (hidden if reviewsUrl is empty) */}
            {reviewsLink && (
              <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-border/60">
                <a
                  href={reviewsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] h-11 items-center justify-center gap-1.5 rounded-full border border-primary/40 bg-card px-4 text-xs sm:text-sm font-semibold text-primary hover:bg-primary/10 active:scale-95 transition cursor-pointer"
                >
                  Read reviews
                </a>
                <a
                  href={reviewsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] h-11 items-center justify-center gap-1.5 rounded-full border border-primary/40 bg-card px-4 text-xs sm:text-sm font-semibold text-primary hover:bg-primary/10 active:scale-95 transition cursor-pointer"
                >
                  Write a review
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Embedded Google Map */}
        <div className="flex flex-col justify-center">
          <iframe
            src={embedUrl}
            title={`${settings.shopName} Google Maps`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[240px] sm:h-[280px] w-full rounded-2xl border border-border/70 bg-muted shadow-xs"
          />
        </div>
      </div>
    </motion.section>
  );
}
