"use client";

import { useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Camera, Loader2, Trash2 } from "lucide-react";
import {
  CATEGORY_LABEL,
  UNIT_INFO,
  emojiFor,
  discOf,
  type Product,
} from "@/lib/catalogue-client";
import type { Edit } from "./AdminPanel";

type Props = {
  product: Product; // saved row (for comparison)
  edit: Edit; // staged edits
  changed: boolean;
  view: Product; // saved row + edits applied (used for display)
  invalid: Set<string>;
  onMarkInvalid: (key: string, bad: boolean) => void;
  onEdit: (patch: Edit) => void;
  onPhotoUploaded: (img: string) => void;
  onPhotoRemoved: () => void;
};

type LocalState = {
  mrp: string;
  price: string;
  disc: string;
};

const fmt = (n: number | null) => (n == null ? "" : String(n));

export function AdminProductRow(props: Props) {
  // Use the saved product's updatedAt as a key so the row remounts (and local
  // state resets) after every save. This sidesteps the "sync local strings when
  // external state changes" problem entirely.
  return <AdminProductRowInner key={props.product.updatedAt} {...props} />;
}

function AdminProductRowInner({
  product,
  changed,
  view,
  invalid,
  onMarkInvalid,
  onEdit,
  onPhotoUploaded,
  onPhotoRemoved,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Local string state for the three number fields so typing feels natural
  // (e.g. clearing the field, typing "1", "10", "100").
  const [local, setLocal] = useState<LocalState>({
    mrp: fmt(view.mrp),
    price: fmt(view.price),
    disc: fmt(discOf(view.price, view.mrp)),
  });
  // Remember the price/mrp at focus-time so discount edits know what to anchor to.
  const focusRef = useRef<{ price: number | null; mrp: number | null } | null>(null);

  const keyOf = (f: string) => `${product.id}:${f}`;

  function parseNum(s: string): { v: number | null } | { bad: true } {
    const t = s.trim();
    if (t === "") return { v: null };
    const n = Number(t);
    if (!isFinite(n) || n < 0 || n > 100000) return { bad: true };
    return { v: Math.round(n * 100) / 100 };
  }

  function handleNumberChange(f: "price" | "mrp" | "disc", raw: string) {
    const next = { ...local, [f]: raw };
    setLocal(next);

    const r = parseNum(raw);
    const k = keyOf(f);
    if ("bad" in r) {
      onMarkInvalid(k, true);
      return;
    }
    onMarkInvalid(k, false);

    if (f === "price") {
      onEdit({ price: r.v });
      // Refresh the discount display to match the new price.
      setLocal((l) => ({ ...l, disc: fmt(discOf(r.v, view.mrp)) }));
    } else if (f === "mrp") {
      onEdit({ mrp: r.v });
      setLocal((l) => ({ ...l, disc: fmt(discOf(view.price, r.v)) }));
    } else {
      // Discount editing: anchor to the price/mrp captured at focus time.
      const base = focusRef.current ?? { price: view.price, mrp: view.mrp };
      const d = r.v;
      if (d == null || d === 0) {
        onEdit({ mrp: null, price: base.price });
        setLocal((l) => ({ ...l, mrp: "", price: fmt(base.price) }));
      } else if (d >= 95) {
        onMarkInvalid(k, true);
        return;
      } else if (base.mrp != null) {
        const newPrice = Math.round(base.mrp * (1 - d / 100) * 100) / 100;
        onEdit({ mrp: base.mrp, price: newPrice });
        setLocal((l) => ({ ...l, price: fmt(newPrice) }));
      } else if (base.price != null) {
        const newMrp = Math.round((base.price / (1 - d / 100)) * 100) / 100;
        onEdit({ price: base.price, mrp: newMrp });
        setLocal((l) => ({ ...l, mrp: fmt(newMrp) }));
      } else {
        onMarkInvalid(k, true);
        return;
      }
    }
  }

  async function handleFile(file: File) {
    if (file.size > 30 * 1024 * 1024) {
      alert("That photo is too large. Pick one under 30 MB.");
      return;
    }
    setUploading(true);
    try {
      const compressed = await compressImage(file);
      const fd = new FormData();
      fd.append("file", compressed, `${product.id}.jpg`);
      fd.append("id", String(product.id));
      const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Upload failed");
      onPhotoUploaded(data.img);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemovePhoto() {
    if (!confirm(`Remove the photo for ${product.name}?`)) return;
    try {
      const r = await fetch("/api/admin/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || "Failed");
      }
      onPhotoRemoved();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed");
    }
  }

  const warn = view.mrp != null && view.price != null && view.price > view.mrp;

  return (
    <article
      className={`rounded-2xl border bg-white p-3 ${
        changed
          ? "border-l-4 border-l-amber border-y-border border-r-border bg-[#fffdf6]"
          : "border-border"
      }`}
    >
      <div className="grid grid-cols-[76px_1fr] gap-3 sm:grid-cols-[88px_1fr]">
        {/* Photo */}
        <div className="relative">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative grid aspect-[4/3] w-full place-items-center overflow-hidden rounded-xl border-2 border-dashed border-[#b7d3b9] bg-g50 text-[28px] hover:border-g600"
            aria-label={`Change photo for ${product.name}`}
          >
            {view.img ? (
              <img
                src={view.img}
                alt=""
                className="absolute inset-0 size-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <span>{emojiFor(view.name, view.cat)}</span>
            )}
            <span className="absolute bottom-1 right-1 grid size-5 place-items-center rounded-full bg-white text-[12px] shadow">
              <Camera className="size-3" />
            </span>
            {uploading && (
              <span className="absolute inset-0 grid place-items-center bg-white/70">
                <Loader2 className="size-5 animate-spin text-g700" />
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) handleFile(f);
            }}
          />
        </div>

        {/* Name + stock toggle + remove photo */}
        <div>
          <b className="block text-[14.5px] leading-tight">{view.name}</b>
          <small className="text-[12px] text-mute">
            PLU {view.id} · {UNIT_INFO[view.unit]?.per} · {CATEGORY_LABEL[view.cat]}
          </small>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-[12.5px] font-semibold">
              <Switch
                checked={view.stock}
                onCheckedChange={(v) => onEdit({ stock: v })}
                aria-label={`Toggle stock for ${product.name}`}
              />
              {view.stock ? "In stock" : "Sold out"}
            </label>
            {view.img && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-destructive hover:underline"
              >
                <Trash2 className="size-3" /> Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Price / MRP / Discount */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <label className="grid gap-1 text-[11.5px] font-bold text-mute">
          MRP ₹
          <Input
            data-f="mrp"
            inputMode="decimal"
            value={local.mrp}
            onChange={(e) => handleNumberChange("mrp", e.target.value)}
            placeholder="—"
            className={`h-9 text-[15px] font-bold ${
              invalid.has(keyOf("mrp")) ? "border-destructive ring-2 ring-[#fde4e4]" : ""
            }`}
          />
        </label>
        <label className="grid gap-1 text-[11.5px] font-bold text-mute">
          Discount %
          <Input
            data-f="disc"
            inputMode="decimal"
            value={local.disc}
            onFocus={() => {
              focusRef.current = { price: view.price, mrp: view.mrp };
            }}
            onChange={(e) => handleNumberChange("disc", e.target.value)}
            placeholder="—"
            className={`h-9 text-[15px] font-bold ${
              invalid.has(keyOf("disc")) ? "border-destructive ring-2 ring-[#fde4e4]" : ""
            }`}
          />
        </label>
        <label className="grid gap-1 text-[11.5px] font-bold text-mute">
          Price ₹
          <Input
            data-f="price"
            inputMode="decimal"
            value={local.price}
            onChange={(e) => handleNumberChange("price", e.target.value)}
            placeholder="At store"
            className={`h-9 text-[15px] font-bold ${
              invalid.has(keyOf("price")) ? "border-destructive ring-2 ring-[#fde4e4]" : ""
            }`}
          />
        </label>
      </div>
      {warn && (
        <p className="mt-2 rounded-md bg-[#fff4e5] px-2.5 py-1.5 text-[12px] text-[#b54708]">
          Price is above MRP, so no discount will show on the storefront.
        </p>
      )}
    </article>
  );
}

/** Compress + resize the chosen photo on the client before uploading. */
async function compressImage(file: File): Promise<File> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(async () => {
    const url = URL.createObjectURL(file);
    try {
      return await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  const W = 640;
  const H = 480;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  const sw = (bmp as ImageBitmap).width || (bmp as HTMLImageElement).naturalWidth;
  const sh = (bmp as ImageBitmap).height || (bmp as HTMLImageElement).naturalHeight;
  const s = Math.max(W / sw, H / sh);
  ctx.drawImage(bmp as CanvasImageSource, (W - sw * s) / 2, (H - sh * s) / 2, sw * s, sh * s);

  const blob: Blob = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.82),
  );
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}
