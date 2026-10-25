"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Loader2,
  Save,
  Check,
  Sparkles,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/catalogue-client";
import { compressToWebp } from "@/lib/image-compress";
import { useUnsavedWarning } from "@/lib/use-unsaved-warning";

type Props = { onSaved: () => void };

type Slot = {
  id: string;
  productId: number | null;
  title: string;
  priceText: string;
  label: string;
  img: string | null;
  sort: number;
};

const MAX_SLOTS = 6;

export function AdminSpecials({ onSaved }: Props) {
  const qc = useQueryClient();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Load existing slots.
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-specials"],
    queryFn: async () => {
      const r = await fetch("/api/admin/specials", { cache: "no-store" });
      if (!r.ok) throw new Error("failed");
      return r.json() as Promise<{ items: Slot[] }>;
    },
  });

  // Load products for the "pick an item" dropdown.
  const { data: prodData } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const r = await fetch("/api/admin/products", { cache: "no-store" });
      if (!r.ok) throw new Error("failed");
      return r.json() as Promise<{ items: Product[] }>;
    },
  });
  const products = prodData?.items ?? [];

  const saved = useMemo(() => data?.items ?? [], [data]);

  useEffect(() => {
    setSlots(saved.map((s) => ({ ...s })));
  }, [saved]);

  const dirty = JSON.stringify(slots) !== JSON.stringify(saved);
  useUnsavedWarning(dirty);

  function patch(id: string, p: Partial<Slot>) {
    setSlots((xs) => xs.map((s) => (s.id === id ? { ...s, ...p } : s)));
  }

  async function addSlot() {
    if (slots.length >= MAX_SLOTS) {
      toast.error(`Maximum ${MAX_SLOTS} slots.`);
      return;
    }
    // Persist immediately so the row has a real id for image uploads.
    try {
      const r = await fetch("/api/admin/specials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New special", priceText: "", label: "" }),
      });
      const resp = await r.json();
      if (!r.ok) throw new Error(resp.error || "Failed to add");
      await refetch();
      qc.invalidateQueries({ queryKey: ["specials"] });
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add");
    }
  }

  async function deleteSlot(id: string) {
    if (!confirm("Remove this Today's Special slot?")) return;
    try {
      const r = await fetch(`/api/admin/specials/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete");
      await refetch();
      qc.invalidateQueries({ queryKey: ["specials"] });
      onSaved();
      toast.success("Slot removed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function uploadImage(id: string, file: File) {
    setUploadingId(id);
    try {
      const webp = await compressToWebp(file, 800);
      const fd = new FormData();
      fd.append("file", webp, `${id}.webp`);
      fd.append("id", id);
      const r = await fetch("/api/admin/specials/upload", { method: "POST", body: fd });
      const resp = await r.json();
      if (!r.ok) throw new Error(resp.error || "Upload failed");
      patch(id, { img: resp.img });
      qc.invalidateQueries({ queryKey: ["specials"] });
      onSaved();
      toast.success("Photo updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploadingId(null);
    }
  }

  async function handleSave() {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      const r = await fetch("/api/admin/specials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: slots.map((s, i) => ({
            id: s.id,
            productId: s.productId,
            title: s.title,
            priceText: s.priceText,
            label: s.label,
            sort: i,
          })),
        }),
      });
      const resp = await r.json();
      if (!r.ok) throw new Error(resp.error || "Save failed");
      await refetch();
      qc.invalidateQueries({ queryKey: ["specials"] });
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 2500);
      toast.success("Saved ✓ Today's Special updated.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center text-mute">
        <Loader2 className="mx-auto mb-2 size-6 animate-spin" />
        Loading Today&apos;s Special…
      </div>
    );
  }

  return (
    <div className="pb-28">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-badge/15 text-badge">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-g900">Today&apos;s Special</h1>
            <p className="text-sm text-mute">
              {slots.length}/{MAX_SLOTS} slots · shown as a carousel on the home
              page. Hidden when there are none.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={addSlot}
          disabled={slots.length >= MAX_SLOTS}
        >
          <Plus className="size-4" /> Add slot
        </Button>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white py-12 text-center text-mute">
          <b className="block text-base text-ink">No specials yet</b>
          Add a slot to highlight a deal on the home page.
        </div>
      ) : (
        <div className="grid gap-2.5">
          {slots.map((s) => (
            <article key={s.id} className="rounded-2xl border border-border bg-white p-3">
              <div className="grid grid-cols-[88px_1fr] gap-3">
                {/* Image */}
                <label className="relative grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-xl border-2 border-dashed border-[#b7d3b9] bg-g50 hover:border-g600">
                  {s.img ? (
                    <img src={s.img} alt="" className="absolute inset-0 size-full object-cover" />
                  ) : (
                    <Camera className="size-5 text-g600/60" />
                  )}
                  <span className="absolute bottom-1 right-1 grid size-5 place-items-center rounded-full bg-white shadow">
                    <Camera className="size-3" />
                  </span>
                  {uploadingId === s.id && (
                    <span className="absolute inset-0 grid place-items-center bg-white/70">
                      <Loader2 className="size-5 animate-spin text-g700" />
                    </span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) uploadImage(s.id, f);
                    }}
                  />
                </label>

                {/* Fields */}
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <Label className="text-[11.5px] text-mute">Link a product (optional)</Label>
                    <Select
                      value={s.productId == null ? "none" : String(s.productId)}
                      onValueChange={(v) =>
                        patch(s.id, { productId: v === "none" ? null : Number(v) })
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Custom (no product)" />
                      </SelectTrigger>
                      <SelectContent className="max-h-72">
                        <SelectItem value="none">Custom (no product)</SelectItem>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    value={s.title}
                    onChange={(e) => patch(s.id, { title: e.target.value })}
                    placeholder="Title (used if no product, or to override)"
                    className="h-9"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={s.priceText}
                      onChange={(e) => patch(s.id, { priceText: e.target.value })}
                      placeholder="Special price e.g. ₹49/kg"
                      className="h-9"
                    />
                    <Input
                      value={s.label}
                      onChange={(e) => patch(s.id, { label: e.target.value })}
                      placeholder="Label e.g. Fresh today"
                      className="h-9"
                    />
                  </div>
                  <button
                    onClick={() => deleteSlot(s.id)}
                    className="inline-flex w-fit items-center gap-1 text-[12px] font-semibold text-destructive hover:underline"
                  >
                    <Trash2 className="size-3" /> Remove slot
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex w-full max-w-[1100px] items-center gap-3">
          <div className="flex-1 text-sm">
            {savedTick ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-g700">
                <Check className="size-4" /> Saved
              </span>
            ) : dirty ? (
              <span className="font-bold text-amber">Unsaved text changes</span>
            ) : (
              <span className="text-mute">Photos save instantly · text saves on Save</span>
            )}
          </div>
          <Button onClick={handleSave} disabled={!dirty || saving} className="bg-g600 hover:bg-g700">
            <Save className="size-4" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
