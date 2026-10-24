"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, LogOut, Save, X, Loader2, CloudOff } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/store/useAdmin";
import { CATEGORY_LABEL, type Product } from "@/lib/catalogue-client";
import { AdminProductRow } from "./AdminProductRow";
import { AdminAddProductDialog } from "./AdminAddProductDialog";

export type Edit = {
  name?: string;
  cat?: string;
  unit?: string;
  price?: number | null;
  mrp?: number | null;
  stock?: boolean;
  img?: string | null;
};

type Props = {
  onSaved: () => void;
};

const FILTER_CHIPS = [
  { key: "all", label: "All" },
  { key: "noprice", label: "No price" },
  { key: "nophoto", label: "No photo" },
  { key: "out", label: "Sold out" },
  { key: "changed", label: "Changed" },
] as const;

export function AdminPanel({ onSaved }: Props) {
  const qc = useQueryClient();
  const logout = useAdmin((s) => s.logout);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [filter, setFilter] = useState<(typeof FILTER_CHIPS)[number]["key"]>("all");
  const [edits, setEdits] = useState<Record<number, Edit>>({});
  const [invalid, setInvalid] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // Fetch the admin-only full catalogue.
  const { data, isLoading, refetch, isError } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const r = await fetch("/api/admin/products", { cache: "no-store" });
      if (r.status === 401) throw new Error("unauthorized");
      if (!r.ok) throw new Error("failed");
      return r.json() as Promise<{ items: Product[] }>;
    },
    retry: 0,
  });

  // If we ever lose auth, flip back to guest so the login screen shows again.
  useEffect(() => {
    if (isError) {
      toast.error("Your session expired – please sign in again");
      logout();
    }
  }, [isError, logout]);

  const products = data?.items ?? [];

  /** Compute the "view" of a product (current edits applied on top of the saved row). */
  const view = useMemo(() => {
    const m = new Map<number, Product & { changed: boolean }>();
    for (const p of products) {
      const e = edits[p.id] ?? {};
      m.set(p.id, {
        ...p,
        name: e.name ?? p.name,
        cat: e.cat ?? p.cat,
        unit: e.unit ?? p.unit,
        price: "price" in e ? e.price! : p.price,
        mrp: "mrp" in e ? e.mrp! : p.mrp,
        stock: "stock" in e ? e.stock! : p.stock,
        img: "img" in e ? e.img! : p.img,
        changed: !!edits[p.id],
      });
    }
    return m;
  }, [products, edits]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list: (Product & { changed: boolean })[] = [];
    for (const p of products) {
      const v = view.get(p.id)!;
      if (cat !== "all" && v.cat !== cat) continue;
      if (q && !v.name.toLowerCase().includes(q) && !v.kn.includes(q) && String(v.id) !== q) continue;
      if (filter === "noprice" && v.price != null) continue;
      if (filter === "nophoto" && v.img) continue;
      if (filter === "out" && v.stock) continue;
      if (filter === "changed" && !v.changed) continue;
      list.push(v);
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, view, search, cat, filter]);

  const counts = useMemo(() => {
    const c = { all: products.length, noprice: 0, nophoto: 0, out: 0, changed: Object.keys(edits).length };
    for (const p of products) {
      const v = view.get(p.id)!;
      if (v.price == null) c.noprice++;
      if (!v.img) c.nophoto++;
      if (!v.stock) c.out++;
    }
    return c;
  }, [products, view, edits]);

  /** Set a partial edit on a product; cleans no-op edits so the dirty flag is accurate. */
  function setEdit(id: number, patch: Edit) {
    setEdits((prev) => {
      const p = products.find((x) => x.id === id);
      if (!p) return prev;
      const e: Edit = { ...(prev[id] ?? {}), ...patch };
      // Drop any field that matches the saved value (so the row stops being "dirty").
      if ("name" in e && e.name === p.name) delete e.name;
      if ("cat" in e && e.cat === p.cat) delete e.cat;
      if ("unit" in e && e.unit === p.unit) delete e.unit;
      if ("price" in e && e.price === p.price) delete e.price;
      if ("mrp" in e && e.mrp === p.mrp) delete e.mrp;
      if ("stock" in e && e.stock === p.stock) delete e.stock;
      if ("img" in e && e.img === p.img) delete e.img;
      const next = { ...prev };
      if (Object.keys(e).length === 0) delete next[id];
      else next[id] = e;
      return next;
    });
  }

  function markInvalid(key: string, bad: boolean) {
    setInvalid((prev) => {
      const n = new Set(prev);
      if (bad) n.add(key);
      else n.delete(key);
      return n;
    });
  }

  async function handlePhotoUploaded(id: number, img: string) {
    // Photo uploads are committed immediately; remember the new URL so the row re-renders
    // without waiting for a full refetch.
    setEdit(id, { img });
    // Also bump the admin list cache so a future refetch shows the same value.
    qc.setQueryData<{ items: Product[] }>(["admin-products"], (old) => {
      if (!old) return old;
      return {
        items: old.items.map((p) => (p.id === id ? { ...p, img } : p)),
      };
    });
  }

  async function handlePhotoRemoved(id: number) {
    setEdit(id, { img: null });
    qc.setQueryData<{ items: Product[] }>(["admin-products"], (old) => {
      if (!old) return old;
      return {
        items: old.items.map((p) => (p.id === id ? { ...p, img: null } : p)),
      };
    });
  }

  async function handleSave() {
    const ids = Object.keys(edits).map(Number);
    if (!ids.length || invalid.size > 0 || saving) return;
    setSaving(true);
    try {
      const changes = ids.map((id) => ({ id, ...edits[id] }));
      const r = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Save failed");
      toast.success(`Saved ${ids.length} change${ids.length > 1 ? "s" : ""}. Storefront updated.`);
      setEdits({});
      await refetch();
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (!Object.keys(edits).length) return;
    if (!confirm("Discard all unsaved changes?")) return;
    setEdits({});
    setInvalid(new Set());
  }

  async function handleLogout() {
    if (Object.keys(edits).length && !confirm("You have unsaved changes. Sign out anyway?")) return;
    await logout();
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }

  const dirtyCount = Object.keys(edits).length;

  return (
    <div className="pb-40">
      {/* Top bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-g900">Catalogue</h1>
          <p className="text-sm text-mute">
            {products.length} items · {dirtyCount ? `${dirtyCount} unsaved` : "all saved"}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="size-4" /> Add new
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-mute hover:text-destructive"
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </div>

      {/* Search + category filter */}
      <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_180px]">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or PLU number…"
          aria-label="Search"
          className="h-11"
        />
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="h-11" aria-label="Category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Filter chips */}
      <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {FILTER_CHIPS.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            aria-pressed={filter === c.key}
            className={`flex-none whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
              filter === c.key
                ? "border-g900 bg-g900 text-white"
                : "border-border bg-white hover:border-g600"
            }`}
          >
            {c.label}{" "}
            <span className={filter === c.key ? "text-white/80" : "text-mute"}>
              {counts[c.key]}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-20 text-center text-mute">
          <Loader2 className="mx-auto mb-2 size-6 animate-spin" />
          Loading catalogue…
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-mute">
          <CloudOff className="mx-auto mb-2 size-6" />
          Session expired.
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-mute">
          <b className="block text-base text-ink">Nothing here</b>
          Try another search or filter.
        </div>
      ) : (
        <div className="grid gap-2.5">
          {filtered.map((p) => (
            <AdminProductRow
              key={p.id}
              product={p}
              edit={edits[p.id] ?? {}}
              changed={!!edits[p.id]}
              view={p}
              invalid={invalid}
              onMarkInvalid={markInvalid}
              onEdit={(patch) => setEdit(p.id, patch)}
              onPhotoUploaded={(img) => handlePhotoUploaded(p.id, img)}
              onPhotoRemoved={() => handlePhotoRemoved(p.id)}
            />
          ))}
        </div>
      )}

      {/* Save bar */}
      {dirtyCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
          <div className="mx-auto flex w-full max-w-[1100px] items-center gap-3">
            <div className="flex-1">
              <div className="text-sm font-bold">
                {dirtyCount} item{dirtyCount > 1 ? "s" : ""} changed
              </div>
              <div className="text-[12px] text-mute">
                {invalid.size > 0
                  ? "Fix the red fields to save"
                  : "Click Save to publish to the live store"}
              </div>
            </div>
            <Button variant="outline" onClick={handleDiscard} disabled={saving}>
              <X className="size-4" /> Discard
            </Button>
            <Button
              onClick={handleSave}
              disabled={invalid.size > 0 || saving}
              className="bg-g600 hover:bg-g700"
            >
              <Save className="size-4" />
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      )}

      <AdminAddProductDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={() => {
          refetch();
          onSaved();
        }}
      />
    </div>
  );
}
