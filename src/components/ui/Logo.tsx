import { cn } from "@/lib/utils";

/** Leaf-in-circle brand mark */
export function LogoMark({ className }: { className?: string | undefined }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-10 w-10", className)} aria-hidden>
      <circle cx="20" cy="20" r="20" className="fill-primary" />
      <path
        d="M12 27c0-9 6-15 17-15-0 10-6 16-15 16"
        className="fill-secondary"
      />
      <path
        d="M12 28c3-5 7-9 12-11"
        className="stroke-primary"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ name, compact }: { name: string; compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark className={compact ? "h-9 w-9" : undefined} />
      <span className="text-[17px] font-bold leading-none tracking-[0.06em] text-primary-deep">
        {name}
      </span>
    </span>
  );
}
