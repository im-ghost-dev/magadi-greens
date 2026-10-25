"use client";

import { useState } from "react";
import { useAdmin } from "@/store/useAdmin";
import { AdminLogin } from "./AdminLogin";
import { AdminPanel } from "./AdminPanel";
import { AdminSettings } from "./AdminSettings";
import { AdminSpecials } from "./AdminSpecials";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Sparkles, Store } from "lucide-react";

type Props = {
  onExit: () => void;
  onSaved: () => void;
};

type Tab = "catalogue" | "specials" | "contact";

const TABS: { key: Tab; label: string; icon: typeof Package }[] = [
  { key: "catalogue", label: "Catalogue", icon: Package },
  { key: "specials", label: "Today's Special", icon: Sparkles },
  { key: "contact", label: "Contact info", icon: Store },
];

/** Decides between the login screen and the admin panel, with top-level tabs. */
export function AdminApp({ onExit, onSaved }: Props) {
  const authed = useAdmin((s) => s.authed);
  const status = useAdmin((s) => s.status);
  const [tab, setTab] = useState<Tab>("catalogue");

  return (
    <div className="min-h-[60vh]">
      <div className="mx-auto w-full max-w-[1100px] px-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="mb-3 text-mute hover:text-ink"
        >
          <ArrowLeft className="size-4" /> Back to store
        </Button>

        {status === "unknown" ? (
          <div className="py-20 text-center text-mute">Checking session…</div>
        ) : authed ? (
          <>
            {/* Admin tab bar (mobile-friendly, horizontally scrollable) */}
            <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto rounded-full border border-border bg-white p-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    aria-pressed={active}
                    className={`flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                      active ? "bg-g900 text-white" : "text-mute hover:bg-cream"
                    }`}
                  >
                    <Icon className="size-4" /> {t.label}
                  </button>
                );
              })}
            </div>

            {tab === "catalogue" && <AdminPanel onSaved={onSaved} />}
            {tab === "specials" && <AdminSpecials onSaved={onSaved} />}
            {tab === "contact" && <AdminSettings onSaved={onSaved} />}
          </>
        ) : (
          <AdminLogin />
        )}
      </div>
    </div>
  );
}
