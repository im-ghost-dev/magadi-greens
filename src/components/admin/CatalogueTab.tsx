"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addProduct, deleteProduct, getProducts, saveProducts } from "@/lib/api";
import { calcDiscount, calcPrice } from "@/lib/format";
import { CATEGORIES, UNITS, type Category, type Product } from "@/types";
import { Chip } from "@/components/storefront/CategoryChips";
import { BottomSheet } from "@/components/storefront/BottomSheet";
import { PhotoButton } from "./PhotoButton";
import { SaveBar } from "./SaveBar";
import { Field, NumInput, Toggle, inputCls } from "./fields";
import { useUnsavedWarning } from "@/lib/use-unsaved-warning";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

type Filter = "All" | Category | "Out of stock";

/** Apply a field edit, keeping MRP / discount / price consistent. */
function applyPricing(
  p: Product,
  field: "mrp" | "discount" | "price",
  v: number | null,
): Product {
  if (field === "mrp")
    return {
      ...p,
      mrp: v,
      price: p.price == null || v == null ? p.price : calcPrice(v, p.discount),
    };
  if (field === "discount") {
    const d = Math.min(100, Math.max(0, v ?? 0));
    return {
      ...p,
      discount: d,
      price: p.price == null || p.mrp == null ? p.price : calcPrice(p.mrp, d),
    };
  }
  return {
    ...p,
    price: v,
    discount: p.mrp && v != null ? calcDiscount(p.mrp, v) : p.discount,
  };
}

export function CatalogueTab({ onDirty }: { onDirty: (d: boolean) => void }) {
  const [saved, setSaved] = useState<Product[] | null>(null);
  const [draft, setDraft] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  useEffect(() => {
    getProducts().then((l) => {
      setSaved(l);
      setDraft(l);
    });
  }, []);

  const changedIds = useMemo(() => {
    if (!saved) return new Set<string>();
    const map = new Map(saved.map((p) => [p.id, JSON.stringify(p)]));
    return new Set(draft.filter((p) => map.get(p.id) !== JSON.stringify(p)).map((p) => p.id));
  }, [saved, draft]);

  const dirty = changedIds.size > 0;
  useUnsavedWarning(dirty);

  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);

  const update = (id: string, fn: (p: Product) => Product) =>
    setDraft((d) => d.map((p) => (p.id === id ? fn(p) : p)));

  const visible = draft.filter((p) => {
    const s = q.trim().toLowerCase();
    if (s && !p.name.toLowerCase().includes(s) && !p.plu.includes(s)) return false;
    if (filter === "All") return true;
    if (filter === "Out of stock") return !p.inStock;
    return p.category === filter;
  });

  async function save() {
    setSaving(true);
    try {
      const changedProducts = draft.filter((p) => changedIds.has(p.id));
      await saveProducts(changedProducts);
      setSaved(draft);
      toast.success("Saved ✓");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    const id = toDelete.id;
    setToDelete(null);
    try {
      await deleteProduct(id);
      setSaved((s) => s?.filter((p) => p.id !== id) ?? null);
      setDraft((d) => d.filter((p) => p.id !== id));
      toast.success("Item deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't delete item.");
    }
  }

  function markAllInStock(inStock: boolean) {
    const affected = visible.filter((p) => p.inStock !== inStock);
    if (affected.length === 0) {
      toast.info(inStock ? "All shown items are already in stock." : "All shown items are already out of stock.");
      return;
    }
    const label = inStock ? "in stock" : "out of stock";
    if (!confirm(`Mark ${affected.length} shown items as ${label}?`)) return;
    setDraft((prev) =>
      prev.map((p) => {
        if (affected.some((a) => a.id === p.id)) {
          return { ...p, inStock };
        }
        return p;
      }),
    );
  }

  if (!saved) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="pb-28">
      <div className="flex gap-2">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or PLU"
            className={cn(inputCls, "pl-9")}
            aria-label="Search catalogue"
          />
        </label>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex h-11 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add item
        </button>
      </div>

      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
        {(["All", ...CATEGORIES, "Out of stock"] as Filter[]).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            {f}
          </Chip>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={() => markAllInStock(true)}
          className="h-11 rounded-xl border border-border bg-card px-3 font-medium hover:bg-secondary cursor-pointer"
        >
          Mark all in stock
        </button>
        <button
          type="button"
          onClick={() => markAllInStock(false)}
          className="h-11 rounded-xl border border-border bg-card px-3 font-medium hover:bg-secondary cursor-pointer"
        >
          Mark all out of stock
        </button>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {visible.map((p) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                "min-w-0 rounded-2xl bg-card p-3 shadow-card border border-border/60",
                changedIds.has(p.id) && "ring-2 ring-sale/60",
                !p.inStock && "bg-muted/60",
              )}
            >
              <div className="flex items-start gap-3">
                <PhotoButton
                  value={p.image}
                  alt={p.name}
                  targetId={p.id}
                  onChange={(img) => update(p.id, (x) => ({ ...x, image: img }))}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    PLU {p.plu} · {p.category} · per {p.unit}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setToDelete(p)}
                  aria-label={`Delete ${p.name}`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <Field label="MRP ₹">
                  <NumInput
                    value={p.mrp}
                    onValue={(v) => update(p.id, (x) => applyPricing(x, "mrp", v))}
                  />
                </Field>
                <Field label="Discount %">
                  <NumInput
                    value={p.discount}
                    disabled={p.price == null}
                    onValue={(v) => update(p.id, (x) => applyPricing(x, "discount", v))}
                  />
                </Field>
                <Field label="Price ₹">
                  {p.price == null ? (
                    <div
                      className={cn(
                        inputCls,
                        "flex items-center justify-center bg-muted px-1 text-xs text-muted-foreground",
                      )}
                    >
                      At store
                    </div>
                  ) : (
                    <NumInput
                      value={p.price}
                      onValue={(v) => update(p.id, (x) => applyPricing(x, "price", v))}
                    />
                  )}
                </Field>
              </div>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4">
                <Toggle
                  label="In stock"
                  checked={p.inStock}
                  onChange={(v) => update(p.id, (x) => ({ ...x, inStock: v }))}
                />
                <Toggle
                  label="Price at store"
                  checked={p.price == null}
                  onChange={(v) =>
                    update(p.id, (x) => ({
                      ...x,
                      price: v ? null : calcPrice(x.mrp ?? 0, x.discount),
                    }))
                  }
                />
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {visible.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No items match your filter.
        </p>
      )}

      <AddItemSheet
        open={adding}
        onClose={() => setAdding(false)}
        onAdded={(p) => {
          setSaved((s) => [p, ...(s ?? [])]);
          setDraft((d) => [p, ...d]);
        }}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the item from the shop catalogue. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SaveBar
        visible={dirty}
        saving={saving}
        onSave={save}
        onDiscard={() => setDraft(saved)}
        label={`${changedIds.size} item${changedIds.size > 1 ? "s" : ""} changed`}
      />
    </div>
  );
}

const emptyItem: Omit<Product, "id"> = {
  name: "",
  plu: "",
  category: "Vegetables",
  unit: "kg",
  mrp: null,
  discount: 0,
  price: 0,
  inStock: true,
  image: null,
};

function AddItemSheet({
  open,
  onClose,
  onAdded,
}: {
  open: boolean;
  onClose: () => void;
  onAdded: (p: Product) => void;
}) {
  const [f, setF] = useState(emptyItem);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const errName = f.name.trim() ? "" : "Name is required";
  const errMrp = f.mrp == null || f.mrp <= 0 ? "Enter an MRP" : "";

  async function submit() {
    setTouched(true);
    if (errName || errMrp) return;
    setBusy(true);
    try {
      const p = await addProduct({
        ...f,
        name: f.name.trim(),
        plu: f.plu || String(Math.floor(1000 + Math.random() * 9000)),
      });
      onAdded(p);
      toast.success(`${p.name} added`);
      setF(emptyItem);
      setTouched(false);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't add item.");
    } finally {
      setBusy(false);
    }
  }

  const setPricingField = (field: "mrp" | "discount" | "price", v: number | null) =>
    setF((x) => applyPricing({ ...x, id: "" }, field, v));

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Add item"
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground disabled:opacity-60 cursor-pointer"
        >
          Add to catalogue
        </button>
      }
    >
      <div className="space-y-3">
        <PhotoButton
          value={f.image}
          alt="New item"
          size="h-20 w-20"
          onChange={(img) => setF({ ...f, image: img })}
        />
        <Field label="Name" error={touched ? errName : ""}>
          <input
            className={inputCls}
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <Field label="PLU">
            <input
              className={inputCls}
              inputMode="numeric"
              value={f.plu}
              onChange={(e) => setF({ ...f, plu: e.target.value })}
            />
          </Field>
          <Field label="Unit">
            <select
              className={inputCls}
              value={f.unit}
              onChange={(e) => setF({ ...f, unit: e.target.value as Product["unit"] })}
            >
              {UNITS.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Category">
          <select
            className={inputCls}
            value={f.category}
            onChange={(e) => setF({ ...f, category: e.target.value as Category })}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="MRP ₹" error={touched ? errMrp : ""}>
            <NumInput value={f.mrp} onValue={(v) => setPricingField("mrp", v)} />
          </Field>
          <Field label="Discount %">
            <NumInput
              value={f.discount}
              disabled={f.price == null}
              onValue={(v) => setPricingField("discount", v)}
            />
          </Field>
          <Field label="Price ₹">
            {f.price == null ? (
              <div
                className={cn(
                  inputCls,
                  "flex items-center justify-center bg-muted text-xs text-muted-foreground",
                )}
              >
                At store
              </div>
            ) : (
              <NumInput value={f.price} onValue={(v) => setPricingField("price", v)} />
            )}
          </Field>
        </div>
        <div className="flex flex-wrap gap-x-4">
          <Toggle
            label="In stock"
            checked={f.inStock}
            onChange={(v) => setF({ ...f, inStock: v })}
          />
          <Toggle
            label="Price at store"
            checked={f.price == null}
            onChange={(v) =>
              setF({ ...f, price: v ? null : calcPrice(f.mrp ?? 0, f.discount) })
            }
          />
        </div>
      </div>
    </BottomSheet>
  );
}
