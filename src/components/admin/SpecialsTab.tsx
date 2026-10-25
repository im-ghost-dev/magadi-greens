"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, EyeOff, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addSpecialSlot,
  deleteSpecialSlot,
  getProducts,
  getSpecials,
  saveSpecials,
  uploadSpecialImage,
} from "@/lib/api";
import type { Product, Special } from "@/types";
import { SpecialsCarousel } from "@/components/storefront/SpecialsCarousel";
import { PhotoButton } from "./PhotoButton";
import { SaveBar } from "./SaveBar";
import { Field, NumInput, inputCls } from "./fields";
import { useUnsavedWarning } from "@/lib/use-unsaved-warning";

const MAX = 6;

export function SpecialsTab({ onDirty }: { onDirty: (d: boolean) => void }) {
  const [saved, setSaved] = useState<Special[] | null>(null);
  const [draft, setDraft] = useState<Special[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSpecials().then((s) => {
      setSaved(s);
      setDraft(s);
    });
    getProducts().then(setProducts);
  }, []);

  const dirty = !!saved && JSON.stringify(saved) !== JSON.stringify(draft);
  useUnsavedWarning(dirty);

  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);

  const update = (i: number, patch: Partial<Special>) =>
    setDraft((d) => d.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const move = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const n = [...d];
      const t = n[i]!;
      n[i] = n[i + dir]!;
      n[i + dir] = t;
      return n;
    });

  function pick(i: number, productId: string) {
    if (!productId) {
      update(i, { productId: null });
      return;
    }
    const p = products.find((x) => x.id === productId);
    if (p) {
      update(i, {
        productId: p.id,
        title: p.name,
        image: p.image ?? null,
        price: p.price,
        priceText: p.price != null ? `₹${p.price} / ${p.unit}` : "",
      });
    }
  }

  async function handleAddSlot() {
    if (draft.length >= MAX) {
      toast.error(`Maximum ${MAX} slots allowed.`);
      return;
    }
    try {
      const slot = await addSpecialSlot({
        title: "New Special",
        priceText: "",
        label: "Fresh today",
      });
      setDraft((d) => [...d, slot]);
      setSaved((s) => [...(s ?? []), slot]);
      toast.success("Slot added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add slot.");
    }
  }

  async function handleDeleteSlot(id: string, index: number) {
    if (!confirm("Remove this Today's Special slot?")) return;
    try {
      await deleteSpecialSlot(id);
      setDraft((d) => d.filter((_, j) => j !== index));
      setSaved((s) => s?.filter((x) => x.id !== id) ?? null);
      toast.success("Slot removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't remove slot.");
    }
  }

  async function handlePhotoUpload(slotId: string, index: number, file: File) {
    try {
      const img = await uploadSpecialImage(slotId, file);
      update(index, { image: img });
      toast.success("Photo updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upload photo.");
    }
  }

  async function save() {
    if (draft.some((s) => !s.title.trim())) {
      toast.error("Every slot needs a title.");
      return;
    }
    setSaving(true);
    try {
      const s = await saveSpecials(draft);
      setSaved(s);
      setDraft(s);
      toast.success("Saved ✓");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  if (!saved) return <div className="h-52 animate-pulse rounded-2xl bg-muted" />;

  return (
    <div className="pb-28">
      <div className="rounded-2xl border border-dashed border-border bg-cream/60 py-2">
        <p className="px-4 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Live preview
        </p>
        {draft.length ? (
          <SpecialsCarousel specials={draft} />
        ) : (
          <p className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
            <EyeOff className="h-4 w-4" /> No slots — the section is hidden on the shop.
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h3 className="font-semibold text-primary-deep">
          Slots ({draft.length}/{MAX})
        </h3>
        <button
          type="button"
          disabled={draft.length >= MAX}
          onClick={handleAddSlot}
          className="flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add slot
        </button>
      </div>

      <ul className="mt-3 space-y-3">
        <AnimatePresence initial={false}>
          {draft.map((s, i) => (
            <motion.li
              key={s.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl bg-card p-3 shadow-card border border-border/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">
                  Slot {i + 1}
                </span>
                <div className="flex">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={i === draft.length - 1}
                    onClick={() => move(i, 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-muted disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Remove slot"
                    onClick={() => handleDeleteSlot(s.id, i)}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <Field label="Linked Product (optional)">
                  <select
                    className={inputCls}
                    value={s.productId ?? ""}
                    onChange={(e) => pick(i, e.target.value)}
                  >
                    <option value="">Custom text (no product)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Display Title">
                  <input
                    className={inputCls}
                    value={s.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                    placeholder="e.g. Fresh Strawberries"
                  />
                </Field>
                <Field label="Special Price (e.g. ₹49/kg)">
                  <input
                    className={inputCls}
                    value={s.priceText || (s.price != null ? `₹${s.price}` : "")}
                    onChange={(e) =>
                      update(i, {
                        priceText: e.target.value,
                        price: parseFloat(e.target.value.replace(/[^\d.]/g, "")) || null,
                      })
                    }
                    placeholder="e.g. ₹49 / kg"
                  />
                </Field>
                <Field label="Label Badge">
                  <input
                    className={inputCls}
                    list="special-labels"
                    value={s.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                  />
                </Field>
              </div>

              <div className="mt-3">
                <PhotoButton
                  value={s.image}
                  alt={s.title}
                  onChange={(img) => update(i, { image: img })}
                />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <datalist id="special-labels">
        <option value="Fresh today" />
        <option value="Just harvested" />
        <option value="Limited stock" />
        <option value="Weekend deal" />
      </datalist>

      <SaveBar
        visible={dirty}
        saving={saving}
        onSave={save}
        onDiscard={() => setDraft(saved)}
      />
    </div>
  );
}
