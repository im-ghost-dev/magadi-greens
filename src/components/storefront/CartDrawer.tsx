"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { emojiFor, fmtQty, rupee, stepOf, maxOf, totals, totalText, UNIT_INFO, type Product } from "@/lib/catalogue-client";
import { useCart } from "@/store/useCart";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSavedOrder: () => void;
};

const STORE_WHATSAPP = "919148112233";

export function CartDrawer({ open, onOpenChange, products, onSavedOrder }: Props) {
  const cart = useCart((s) => s.cart);
  const add = useCart((s) => s.add);
  const sub = useCart((s) => s.sub);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("In 30 minutes");
  const [sending, setSending] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  // Reset form when drawer closes.
  useEffect(() => {
    if (!open) {
      setSending(false);
    }
  }, [open]);

  // Focus the close button when opened (Sheet handles this automatically, but be safe).
  useEffect(() => {
    if (open && firstInputRef.current && Object.keys(cart).length === 0) {
      // Don't auto-focus inputs on open – let the user browse.
    }
  }, [open, cart]);

  const lines = products.filter((p) => cart[p.id] > 0);
  const t = totals(products, cart);
  const tText = totalText(products, cart);

  const handleSend = async () => {
    if (!lines.length) return;
    if (!name.trim()) {
      toast.error("Please enter your name");
      firstInputRef.current?.focus();
      return;
    }
    const phoneDigits = phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    setSending(true);
    const rowsTxt = lines
      .map(
        (p, i) =>
          `${i + 1}. ${p.name} [PLU ${p.id}] × ${fmtQty(p, cart[p.id])} = ${
            p.price == null ? "price at store" : rupee(Math.round(p.price * cart[p.id] * 100) / 100)
          }`,
      )
      .join("\n");
    const msg = `*🌿 New self pick-up order – MAGADI GREENS*\n\n*Name:* ${name}\n*Phone:* ${phoneDigits}\n*Pick-up:* ${time}\n\n*Order:*\n${rowsTxt}\n\n*Estimated total: ${tText}*`;
    const waLink = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(msg)}`;

    try {
      window.open(waLink, "_blank", "noopener");
      toast.success("Opened WhatsApp – send the message and we'll pack your order.");
      clear();
      onSavedOrder();
      onOpenChange(false);
    } catch {
      toast.error("Couldn't open WhatsApp. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[440px]"
      >
        <SheetHeader className="border-b border-border p-5 pb-3">
          <SheetTitle className="text-lg font-extrabold">Your pick-up list</SheetTitle>
          <SheetDescription className="text-g700">
            We&apos;ll pack these and keep them ready
          </SheetDescription>
        </SheetHeader>

        <div className="thin-scroll flex-1 overflow-y-auto px-5 py-2">
          {lines.length === 0 ? (
            <div className="py-9 text-center text-mute">
              <b className="block text-base text-ink">Your list is empty</b>
              Add a few items and they&apos;ll show up here.
            </div>
          ) : (
            lines.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[48px_1fr_auto] items-center gap-3 border-b border-border py-3"
              >
                <div className="grid size-12 place-items-center overflow-hidden rounded-xl bg-g50 text-[26px]">
                  {p.img ? (
                    <img
                      src={p.img}
                      alt=""
                      loading="lazy"
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
                <div>
                  <b className="block text-[14px] leading-tight">{p.name}</b>
                  <small className="text-[12px] text-mute">
                    {p.price == null
                      ? "Price at store"
                      : `${rupee(p.price)} ${UNIT_INFO[p.unit]?.per}`}
                  </small>
                  <div className="mt-1.5 flex h-[34px] w-32 items-center justify-between overflow-hidden rounded-[10px] border-[1.5px] border-g600 bg-g50">
                    <button
                      onClick={() => sub(p.id, stepOf(p))}
                      aria-label={`Remove one ${p.name}`}
                      className="grid h-full w-8 place-items-center text-g700 hover:bg-g100"
                    >
                      <Minus className="size-4" strokeWidth={3} />
                    </button>
                    <span className="text-[15px] font-extrabold">
                      {fmtQty(p, cart[p.id])}
                    </span>
                    <button
                      onClick={() => add(p.id, stepOf(p), maxOf(p))}
                      aria-label={`Add one ${p.name}`}
                      className="grid h-full w-8 place-items-center text-g700 hover:bg-g100"
                    >
                      <Plus className="size-4" strokeWidth={3} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 self-start">
                  <div className="text-[15px] font-extrabold">
                    {p.price == null
                      ? "At store"
                      : rupee(Math.round(p.price * cart[p.id] * 100) / 100)}
                  </div>
                  <button
                    onClick={() => remove(p.id)}
                    aria-label={`Remove ${p.name} from list`}
                    className="grid size-7 place-items-center rounded-full text-mute hover:bg-cream hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))
          )}

          {lines.length > 0 && (
            <div className="mt-4 grid gap-2.5">
              <h3 className="text-[12.5px] font-bold text-mute">Pick-up details</h3>
              <Input
                ref={firstInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
              />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                inputMode="numeric"
                placeholder="10-digit mobile number"
                autoComplete="tel"
                maxLength={10}
              />
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In 30 minutes">In 30 minutes</SelectItem>
                  <SelectItem value="Today morning (8 AM – 12 PM)">
                    Today morning (8 AM – 12 PM)
                  </SelectItem>
                  <SelectItem value="Today evening (5 PM – 8:30 PM)">
                    Today evening (5 PM – 8:30 PM)
                  </SelectItem>
                </SelectContent>
              </Select>
              {t.ask > 0 && (
                <p className="text-[12.5px] text-mute">
                  {t.ask} item{t.ask > 1 ? "s" : ""} will be weighed and priced at the store.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border bg-white p-5">
          <div className="mb-3 flex items-center justify-between text-[17px] font-extrabold">
            <span>Estimated total</span>
            <span className="text-g700">{tText}</span>
          </div>
          <Button
            onClick={handleSend}
            disabled={!lines.length || sending}
            className="h-12 w-full gap-2 bg-wa text-[#073b1b] text-[15px] font-bold hover:bg-[#1fbf5b]"
          >
            <MessageCircle className="size-5" />
            {sending ? "Opening WhatsApp…" : "Send order on WhatsApp"}
          </Button>
          <p className="mt-2 text-center text-[12px] text-mute">
            Opens WhatsApp to MAGADI GREENS with your order pre-filled.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
