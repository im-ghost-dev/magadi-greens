"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getSettings, saveSettings, uploadLogoImage, changeAdminPassword } from "@/lib/api";
import type { ShopSettings } from "@/types";
import { ContactSection } from "@/components/storefront/ContactSection";
import { LogoMark } from "@/components/ui/Logo";
import { Camera, KeyRound, Loader2, Lock, Trash2 } from "lucide-react";
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changingPw, setChangingPw] = useState(false);

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

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);
    try {
      const url = await uploadLogoImage(file);
      setDraft((prev) => (prev ? { ...prev, logoUrl: url } : prev));
      toast.success("Logo uploaded ✓ Click Save to publish.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function save() {
    if (invalid || !draft) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const s = await saveSettings(draft);
      setSaved(s);
      setDraft(s);
      toast.success("Saved ✓ Contact info updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save contact info.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPw.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("New passwords do not match.");
      return;
    }
    setChangingPw(true);
    try {
      await changeAdminPassword(currentPw, newPw);
      toast.success("Admin password changed successfully ✓");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      setShowPasswordSection(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <div className="grid gap-6 pb-28 lg:grid-cols-2">
      <div className="space-y-4 rounded-2xl bg-card p-4 shadow-card border border-border/60">
        <h3 className="text-base font-semibold text-primary-deep">Shop &amp; Contact Details</h3>

        {/* Store Logo Management */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Store Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <LogoMark logoUrl={draft.logoUrl} className="h-14 w-14" alt={draft.shopName} />
              {uploadingLogo && (
                <div className="absolute inset-0 grid place-items-center rounded-full bg-background/80">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleLogoUpload(f);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted active:scale-95 transition cursor-pointer"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {draft.logoUrl ? "Change logo" : "Upload logo"}
                </button>
                {draft.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, logoUrl: null })}
                    className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Replaces the default leaf mark in the header and footer. Recommended square image (PNG, SVG, or WebP).
              </p>
            </div>
          </div>
          <div className="mt-3">
            <Field label="Or direct logo image URL">
              <input
                className={inputCls}
                value={draft.logoUrl ?? ""}
                placeholder="https://... or /images/logo.png"
                onChange={(e) => setDraft({ ...draft, logoUrl: e.target.value || null })}
              />
            </Field>
          </div>
        </div>

        {/* Security & Password Management */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Security &amp; Admin Password
              </span>
              <p className="text-[11.5px] text-muted-foreground">
                Manage the password used to sign in to the store admin panel.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-muted active:scale-95 transition cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5" />
              {showPasswordSection ? "Hide" : "Change password"}
            </button>
          </div>

          {showPasswordSection && (
            <form onSubmit={handleChangePassword} className="space-y-2.5 pt-2 border-t border-border/60">
              <Field label="Current password">
                <input
                  type="password"
                  className={inputCls}
                  placeholder="Enter current password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                />
              </Field>
              <Field label="New password (min 8 chars)">
                <input
                  type="password"
                  className={inputCls}
                  placeholder="Enter new strong password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm new password">
                <input
                  type="password"
                  className={inputCls}
                  placeholder="Re-enter new password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                />
              </Field>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={changingPw}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-bold hover:bg-primary/90 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {changingPw ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                  {changingPw ? "Updating…" : "Update password"}
                </button>
              </div>
            </form>
          )}
        </div>

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
