"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Package, Sparkles, Store, ExternalLink } from "lucide-react";
import { adminLogout, isAdmin } from "@/lib/api";
import { AdminLogin } from "./AdminLogin";
import { CatalogueTab } from "./CatalogueTab";
import { SpecialsTab } from "./SpecialsTab";
import { ShopInfoTab } from "./ShopInfoTab";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "catalogue", label: "Catalogue", icon: Package },
  { id: "specials", label: "Today's Special", icon: Sparkles },
  { id: "shop", label: "Shop Info", icon: Store },
] as const;

type TabId = (typeof TABS)[number]["id"];
const LEAVE_MSG = "You have unsaved changes. Leave without saving?";

export function AdminApp({
  onExit,
  onSaved,
}: {
  onExit: () => void;
  onSaved?: () => void;
}) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<TabId>("catalogue");
  const [dirty, setDirty] = useState(false);
  const onDirty = useCallback((d: boolean) => setDirty(d), []);

  useEffect(() => {
    isAdmin().then(setAuthed);
  }, []);

  function switchTab(t: TabId) {
    if (t === tab) return;
    if (dirty && !window.confirm(LEAVE_MSG)) return;
    setDirty(false);
    setTab(t);
  }

  async function handleLogout() {
    if (dirty && !window.confirm(LEAVE_MSG)) return;
    await adminLogout();
    setDirty(false);
    setAuthed(false);
  }

  if (authed === null) {
    return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Checking session…</div>;
  }

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} onBack={onExit} />;
  }

  return (
    <div className="min-h-screen pb-16">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo name="Admin" compact />
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (dirty && !window.confirm(LEAVE_MSG)) return;
                onExit();
              }}
              className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium hover:bg-secondary cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">View shop</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium hover:bg-secondary cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-2" role="tablist">
          {TABS.map((t) => (
            <button
              type="button"
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => switchTab(t.id)}
              className={cn(
                "relative flex h-12 flex-1 items-center justify-center gap-1.5 text-sm font-medium transition cursor-pointer",
                tab === t.id ? "text-primary-deep" : "text-muted-foreground",
              )}
            >
              <t.icon className="h-4 w-4" /> <span className="truncate">{t.label}</span>
              {tab === t.id && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "catalogue" && <CatalogueTab onDirty={onDirty} />}
            {tab === "specials" && <SpecialsTab onDirty={onDirty} />}
            {tab === "shop" && <ShopInfoTab onDirty={onDirty} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
