"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "@/lib/api";
import type { ShopSettings } from "@/types";
import { ContactSection } from "@/components/storefront/ContactSection";
import { SaveBar } from "./SaveBar";
import { Field, inputCls } from "./fields";
import { useUnsavedWarning } from "@/lib/use-unsaved-warning";

const FIELDS: { key: keyof ShopSettings; label: string; placeholder?: string }[] = [
  { key: "shopName", label: "Shop name" },
  { key: "tagline", label: "Tagline" },
  {
    key: "bannerText",
    label: "Top announcement banner text (leave blank to hide)",
    placeholder: "Self pick-up only. Order online and we'll pack it fresh and keep it ready.",
  },
  { key: "phone", label: "Phone", placeholder: "+91 91481 12233" },
  {
    key: "whatsapp",
    label: "WhatsApp number (with country code, digits only)",
    placeholder: "919148112233",
  },
  { key: "address", label: "Address" },
  { key: "hours", label: "Opening hours" },
  { key: "mapsUrl", label: "Google Maps link" },
  {
    key: "reviewsUrl",
    label: "Google reviews link (leave blank to hide review buttons)",
    placeholder: "https://maps.app.goo.gl/...",
  },
];

export function ShopInfoTab({ onDirty }: { onDirty: (d: boolean) => void }) {
  const [saved, setSaved] = useState<ShopSettings | null>(null);
  const [draft, setDraft] = useState<ShopSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      setSaved(s);
      setDraft(s);
    });
  }, []);

  const dirty = !!saved && JSON.stringify(saved) !== JSON.stringify(draft);
  useUnsavedWarning(dirty);

  useEffect(() => {
    onDirty(dirty);
  }, [dirty, onDirty]);

  if (!draft || !saved) {
    return <div className="h-60 animate-pulse rounded-2xl bg-muted" />;
  }

  const errors: Partial<Record<keyof ShopSettings, string>> = {
    shopName: draft.shopName.trim() ? "" : "Required",
    whatsapp: /^\d{10,15}$/.test(draft.whatsapp)
      ? ""
      : "Digits only with country code (e.g. 919148112233)",
    mapsUrl:
      !draft.mapsUrl || /^https?:\/\//i.test(draft.mapsUrl)
        ? ""
        : "Must start with http:// or https://",
    reviewsUrl:
      !draft.reviewsUrl || /^https?:\/\//i.test(draft.reviewsUrl)
        ? ""
        : "Must start with http:// or https://",
  };
  const invalid = Object.values(errors).some(Boolean);

  async function save() {
    if (invalid || !draft) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const s = await saveSettings(draft);
      setSaved(s);
      toast.success("Saved ✓ Contact info updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save contact info.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 pb-28 lg:grid-cols-2">
      <div className="space-y-3 rounded-2xl bg-card p-4 shadow-card border border-border/60">
        <h3 className="text-base font-semibold text-primary-deep">Shop &amp; Contact Details</h3>
        {FIELDS.map((f) => (
          <Field key={f.key} label={f.label} error={errors[f.key]}>
            <input
              className={inputCls}
              value={draft[f.key] ?? ""}
              placeholder={f.placeholder}
              inputMode={f.key === "whatsapp" ? "numeric" : undefined}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  [f.key]:
                    f.key === "whatsapp"
                      ? e.target.value.replace(/\D/g, "")
                      : e.target.value,
                })
              }
            />
          </Field>
        ))}
      </div>
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Live customer preview
        </p>
        <ContactSection settings={draft} />
      </div>
      <SaveBar
        visible={dirty}
        saving={saving}
        onSave={save}
        onDiscard={() => setDraft(saved)}
      />
    </div>
  );
}
