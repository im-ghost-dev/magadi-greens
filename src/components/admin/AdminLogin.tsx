"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { adminLogin } from "@/lib/api";
import { LogoMark } from "@/components/ui/Logo";
import { inputCls } from "./fields";
import { cn } from "@/lib/utils";

export function AdminLogin({
  onSuccess,
  onBack,
}: {
  onSuccess: () => void;
  onBack?: () => void;
}) {
  const [pw, setPw] = useState("");
  const [stay, setStay] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const ok = await adminLogin(pw, stay);
      if (ok) {
        onSuccess();
      } else {
        setError("That password isn't right. Please try again.");
      }
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center px-4 py-8">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, x: error ? [0, -8, 8, -4, 0] : 0 }}
        className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-lift border border-border/60"
      >
        <LogoMark className="h-12 w-12" />
        <h1 className="mt-4 text-2xl font-bold text-primary-deep">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage products, specials and shop info.
        </p>

        <div className="relative mt-6">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            aria-label="Password"
            aria-invalid={!!error}
            autoFocus
            className={cn(
              inputCls,
              "pl-9 pr-11",
              error && "border-destructive focus:border-destructive focus:ring-destructive/30",
            )}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground cursor-pointer"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <label className="mt-4 flex h-11 cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={stay}
            onChange={(e) => setStay(e.target.checked)}
            className="h-5 w-5 accent-primary rounded"
          />
          Stay signed in
        </label>

        <button
          type="submit"
          disabled={busy || !pw}
          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary font-semibold text-primary-foreground transition active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
        </button>
      </motion.form>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 flex h-11 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </button>
      )}
    </div>
  );
}
