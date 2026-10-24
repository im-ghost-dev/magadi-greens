"use client";

import { useState } from "react";
import { useAdmin } from "@/store/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function AdminLogin() {
  const setAuthed = useAdmin((s) => s.setAuthed);
  const setStatus = useAdmin((s) => s.setStatus);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErr("Enter the admin password");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, remember }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error || "Login failed");
        return;
      }
      setAuthed(true);
      toast.success("Signed in to admin");
    } catch {
      setErr("Network error – please try again");
      setStatus("guest");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-2xl border border-border bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-g900 text-white">
            <Lock className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-extrabold text-g900">MAGADI GREENS admin</h1>
            <p className="text-sm text-mute">
              Sign in to update prices, discounts, photos and stock.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-3.5">
          <div className="grid gap-1.5">
            <Label htmlFor="pw">Admin password</Label>
            <div className="relative">
              <Input
                id="pw"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-mute hover:text-ink"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
            Keep me signed in on this device
          </Label>

          {err && (
            <p role="alert" className="text-sm font-medium text-destructive">
              {err}
            </p>
          )}

          <Button type="submit" disabled={busy} className="h-11 bg-g600 hover:bg-g700">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
