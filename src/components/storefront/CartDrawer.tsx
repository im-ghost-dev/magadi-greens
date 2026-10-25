"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { BottomSheet } from "./BottomSheet";
import { ProductImage } from "./ProductImage";
import { AnimatedQty } from "./AnimatedQty";
import { useCart } from "@/hooks/useCart";
import { getProducts } from "@/lib/api";
import {
  buildWhatsAppMessage,
  estimate,
  formatQty,
  lineTotal,
  rupee,
  stepFor,
  unitPrice,
  whatsappUrl,
} from "@/lib/format";
import type { Product, ShopSettings } from "@/types";
import { cn } from "@/lib/utils";

const TIMES = [
  "In 30 minutes",
  "In 1 hour",
  "In 2 hours",
  "This evening (5–7 PM)",
  "Tomorrow morning",
];
const FORM_KEY = "mg_pickup_form";

export function CartDrawer({ settings }: { settings: ShopSettings | null }) {
  const { open, setOpen, lines, setQty, remove, replaceLines, clear } = useCart();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [priceUpdated, setPriceUpdated] = useState<Set<string>>(new Set());
  const [form, setForm] = useState({ name: "", phone: "", time: "" });
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const f = localStorage.getItem(FORM_KEY);
        if (f) setForm(JSON.parse(f));
      } catch {
        /* ignore */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(FORM_KEY, JSON.stringify(form));
  }, [form]);

  // Recalculate every line from the latest product data whenever the drawer opens.
  useEffect(() => {
    if (!open) return;
    let alive = true;
    getProducts().then((list) => {
      if (!alive) return;
      setProducts(list);
      const changed = new Set<string>();
      const next = lines.map((l) => {
        const p = list.find((x) => x.id === l.productId);
        if (p && p.price !== l.priceSnapshot) {
          changed.add(l.productId);
          return { ...l, priceSnapshot: p.price };
        }
        return l;
      });
      setPriceUpdated(changed);
      if (changed.size) replaceLines(next);
    });
    return () => {
      alive = false;
    };
  }, [open]);

  const rows = useMemo(
    () =>
      lines.map((line) => ({
        line,
        product: products?.find((p) => p.id === line.productId) ?? null,
      })),
    [lines, products],
  );

  const blocked = rows.filter((r) => !r.product || !r.product.inStock);
  const valid = rows.filter(
    (r): r is { line: typeof r.line; product: Product } =>
      !!r.product && r.product.inStock,
  );
  const est = estimate(valid.map((r) => ({ price: r.product.price, qty: r.line.qty })));

  const errors = {
    name: form.name.trim().length < 2 ? "Please enter your name" : "",
    phone: /^\d{10}$/.test(form.phone) ? "" : "Enter a 10-digit mobile number",
    time: form.time ? "" : "Choose a pick-up time",
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const canSend = !!(products && lines.length > 0 && blocked.length === 0 && settings);

  function send() {
    setTouched(true);
    if (hasErrors || !canSend || !settings) return;
    const msg = buildWhatsAppMessage({
      settings,
      name: form.name.trim(),
      phone: form.phone,
      time: form.time,
      items: valid,
    });
    window.open(whatsappUrl(settings.whatsapp, msg), "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp…", {
      description: "Send the message to confirm your pick-up.",
    });
  }

  const field =
    "h-11 w-full rounded-xl border border-input bg-card px-3 text-[15px] outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

  return (
    <BottomSheet
      open={open}
      onClose={() => setOpen(false)}
      title="Your pick-up list"
      footer={
        lines.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Estimated total</span>
              <span className="text-lg font-bold text-primary-deep">
                {rupee(est.total)}
                {est.storePriced > 0 && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {" "}
                    + store-priced items
                  </span>
                )}
              </span>
            </div>
            {blocked.length > 0 && (
              <p className="text-xs font-medium text-destructive">
                Remove unavailable items to send your order.
              </p>
            )}
            <button
              type="button"
              onClick={send}
              disabled={!canSend}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-whatsapp text-base font-semibold text-whatsapp-foreground shadow-card transition active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="h-5 w-5" /> Send order on WhatsApp
            </button>
          </div>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <ShoppingBasket className="h-7 w-7 text-primary" />
          </div>
          <p className="mt-4 font-semibold">Your list is empty</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add some fresh produce to get started.
          </p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
              {rows.map(({ line, product: p }) => {
                const gone = !p;
                const oos = p && !p.inStock;
                const total = p ? lineTotal(p.price, line.qty) : null;
                return (
                  <motion.li
                    key={line.productId}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className={cn(
                      "overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card",
                      (gone || oos) && "ring-1 ring-destructive/50",
                    )}
                  >
                    <div className="flex gap-3 p-3">
                      <ProductImage
                        src={p?.image}
                        alt={p?.name ?? "Removed item"}
                        className="h-16 w-16 shrink-0 rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate font-semibold">
                            {p?.name ?? "Item no longer available"}
                          </p>
                          <button
                            type="button"
                            onClick={() => remove(line.productId)}
                            aria-label="Remove"
                            className="-mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {gone || oos ? (
                          <p className="flex items-center gap-1 text-xs font-medium text-destructive">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {gone ? "Removed from the shop" : "Out of stock now"} — please remove
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {p!.price != null ? unitPrice(p!.price, p!.unit) : "Price at store"}
                            {priceUpdated.has(line.productId) && (
                              <span className="ml-1.5 rounded bg-sale/20 px-1.5 py-0.5 font-medium text-sale-foreground">
                                price updated
                              </span>
                            )}
                          </p>
                        )}
                        {p && !oos && (
                          <div className="mt-1 flex items-center justify-between">
                            <div className="flex items-center rounded-xl bg-secondary">
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                aria-label="Decrease"
                                onClick={() =>
                                  setQty(p.id, +(line.qty - stepFor(p.unit)).toFixed(2))
                                }
                                className="flex h-11 w-11 items-center justify-center cursor-pointer"
                              >
                                <Minus className="h-4 w-4" />
                              </motion.button>
                              <AnimatedQty
                                value={line.qty}
                                label={formatQty(line.qty, p.unit)}
                                className="min-w-14 text-sm font-semibold"
                              />
                              <motion.button
                                whileTap={{ scale: 0.85 }}
                                aria-label="Increase"
                                onClick={() =>
                                  setQty(p.id, +(line.qty + stepFor(p.unit)).toFixed(2))
                                }
                                className="flex h-11 w-11 items-center justify-center cursor-pointer"
                              >
                                <Plus className="h-4 w-4" />
                              </motion.button>
                            </div>
                            <span className="font-semibold text-primary-deep">
                              {total != null ? rupee(total) : "At store"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <button
            type="button"
            onClick={clear}
            className="mt-2 h-11 text-sm font-medium text-muted-foreground underline-offset-4 hover:underline cursor-pointer"
          >
            Clear list
          </button>

          <div className="mt-4 space-y-3">
            <h3 className="font-semibold text-primary-deep">Pick-up details</h3>
            <div>
              <input
                className={field}
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                aria-label="Name"
              />
              {touched && errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div>
              <input
                className={field}
                placeholder="10-digit mobile number"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })
                }
                aria-label="Phone"
              />
              {touched && errors.phone && (
                <p className="mt-1 text-xs text-destructive">{errors.phone}</p>
              )}
            </div>
            <div>
              <select
                className={field}
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                aria-label="Pick-up time"
              >
                <option value="">Pick-up time…</option>
                {TIMES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              {touched && errors.time && (
                <p className="mt-1 text-xs text-destructive">{errors.time}</p>
              )}
            </div>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
