import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputCls =
  "h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3 text-[15px] outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:bg-muted disabled:text-muted-foreground";

export function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function NumInput({
  value,
  onValue,
  ...rest
}: {
  value: number | null;
  onValue: (n: number | null) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      {...rest}
      inputMode="decimal"
      className={cn(inputCls, "px-2 text-center", rest.className)}
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value.replace(/[^\d.]/g, "");
        onValue(v === "" ? null : Number(v));
      }}
    />
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex h-11 items-center gap-2 text-sm font-medium cursor-pointer"
    >
      <span
        className={cn(
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-primary" : "bg-input",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-card transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}
