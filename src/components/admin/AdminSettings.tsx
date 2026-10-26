"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Check, Store } from "lucide-react";
import { toast } from "sonner";
import { DEFAULT_SETTINGS, cleanWhatsApp, type Settings } from "@/lib/settings";
import { useUnsavedWarning } from "@/lib/use-unsaved-warning";

type Props = { onSaved: () => void };

type Form = Omit<Settings, "updatedAt">;

const FIELDS: { key: keyof Form; label: string; hint?: string; textarea?: boolean }[] = [
  { key: "shopName", label: "Shop name" },
  { key: "tagline", label: "Tagline", hint: "Short line under the logo" },
  {
    key: "bannerText",
    label: "Top announcement banner text",
    hint: "Leave blank to hide the banner. Shown above the sticky header.",
  },
  { key: "phone", label: "Phone (shown to customers)" },
  {
    key: "whatsapp",
    label: "WhatsApp number for orders",
    hint: "Full number incl. country code, digits only. Orders are sent here.",
  },
  { key: "address", label: "Address", textarea: true },
  { key: "hours", label: "Opening hours" },
  { key: "mapsUrl", label: "Google Maps link" },
  {
    key: "reviewsUrl",
    label: "Google reviews link",
    hint: "Leave blank to hide review buttons.",
  },
];

export function AdminSettings({ onSaved }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const r = await fetch("/api/settings", { cache: "no-store" });
      if (!r.ok) throw new Error("failed");
      return r.json() as Promise<Settings>;
    },
  });

  // Initialise the editable form once the saved values arrive.
  useEffect(() => {
    if (data && !form) {
      const { updatedAt: _u, ...rest } = data;
      void _u;
      setForm(rest);
    }
  }, [data, form]);

  const saved: Form = useMemo(() => {
    if (!data) return { ...DEFAULT_SETTINGS };
    const { updatedAt: _u, ...rest } = data;
    void _u;
    return rest;
  }, [data]);

  const dirty = !!form && JSON.stringify(form) !== JSON.stringify(saved);
  useUnsavedWarning(dirty);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function handleSave() {
    if (!form || saving) return;
    const wa = cleanWhatsApp(form.whatsapp);
    if (wa.length < 10 || wa.length > 15) {
      toast.error("Enter a valid WhatsApp number with country code (e.g. 919148112233).");
      return;
    }
    if (!form.shopName.trim()) {
      toast.error("Shop name can't be empty.");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, whatsapp: wa }),
      });
      const resp = await r.json();
      if (!r.ok) throw new Error(resp.error || "Save failed");
      const { updatedAt: _u, ...rest } = resp.settings as Settings;
      void _u;
      setForm(rest);
      qc.setQueryData(["admin-settings"], resp.settings);
      qc.invalidateQueries({ queryKey: ["settings"] });
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 2500);
      toast.success("Saved ✓ Contact info updated.");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !form) {
    return (
      <div className="py-20 text-center text-mute">
        <Loader2 className="mx-auto mb-2 size-6 animate-spin" />
        Loading contact info…
      </div>
    );
  }

  return (
    <div className="pb-28">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-full bg-g900 text-white">
          <Store className="size-4" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold text-g900">Contact &amp; shop info</h1>
          <p className="text-sm text-mute">
            Shown in the header, footer and store section. Changing the WhatsApp
            number changes where orders are sent.
          </p>
        </div>
      </div>

      <div className="grid gap-3.5 rounded-2xl border border-border bg-white p-4 sm:p-5">
        {FIELDS.map((f) => (
          <div key={f.key} className="grid gap-1.5">
            <Label htmlFor={`st-${f.key}`}>{f.label}</Label>
            {f.textarea ? (
              <Textarea
                id={`st-${f.key}`}
                value={form[f.key] ?? ""}
                onChange={(e) => set(f.key, e.target.value)}
                rows={2}
              />
            ) : (
              <Input
                id={`st-${f.key}`}
                value={form[f.key] ?? ""}
                inputMode={f.key === "whatsapp" ? "numeric" : undefined}
                onChange={(e) =>
                  set(
                    f.key,
                    f.key === "whatsapp"
                      ? e.target.value.replace(/[^\d]/g, "").slice(0, 15)
                      : e.target.value,
                  )
                }
              />
            )}
            {f.hint && <small className="text-[12px] text-mute">{f.hint}</small>}
          </div>
        ))}
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]">
        <div className="mx-auto flex w-full max-w-[1100px] items-center gap-3">
          <div className="flex-1 text-sm">
            {savedTick ? (
              <span className="inline-flex items-center gap-1.5 font-bold text-g700">
                <Check className="size-4" /> Saved
              </span>
            ) : dirty ? (
              <span className="font-bold text-amber">Unsaved changes</span>
            ) : (
              <span className="text-mute">All changes saved</span>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={!dirty || saving}
            className="bg-g600 hover:bg-g700"
          >
            <Save className="size-4" />
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
