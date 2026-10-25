import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import type { ShopSettings } from "@/types";
import { Logo } from "@/components/ui/Logo";
import { whatsappUrl } from "@/lib/format";

export function ContactSection({ settings }: { settings: ShopSettings }) {
  return (
    <section
      className="rounded-3xl bg-primary-deep p-6 text-primary-foreground sm:p-10 shadow-lift"
      aria-label="Contact"
    >
      <div className="rounded-2xl bg-card/95 p-3 inline-block">
        <Logo name={settings.shopName} compact />
      </div>
      <p className="mt-3 text-sm text-primary-foreground/75">{settings.tagline}</p>
      <ul className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
        <li className="flex gap-3">
          <MapPin className="h-5 w-5 shrink-0 text-sale" />
          {settings.address}
        </li>
        <li className="flex gap-3">
          <Clock className="h-5 w-5 shrink-0 text-sale" />
          {settings.hours}
        </li>
        <li className="flex gap-3">
          <Phone className="h-5 w-5 shrink-0 text-sale" />
          <a
            href={`tel:${settings.phone.replace(/\s/g, "")}`}
            className="underline-offset-4 hover:underline"
          >
            {settings.phone}
          </a>
        </li>
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        {settings.mapsUrl && (
          <a
            href={settings.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center gap-2 rounded-full bg-primary-foreground/10 px-5 text-sm font-semibold ring-1 ring-primary-foreground/25 transition hover:bg-primary-foreground/20 cursor-pointer"
          >
            <Navigation className="h-4 w-4" /> Open in Maps
          </a>
        )}
        <a
          href={whatsappUrl(settings.whatsapp, `Hi ${settings.shopName}!`)}
          target="_blank"
          rel="noreferrer"
          className="flex h-11 items-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-semibold text-whatsapp-foreground transition hover:brightness-110 cursor-pointer"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp us
        </a>
      </div>
    </section>
  );
}
