"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/** Sticky bar shown only while there are unsaved changes. */
export function SaveBar({
  visible,
  saving,
  onSave,
  onDiscard,
  label = "You have unsaved changes",
}: {
  visible: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  label?: string;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-2xl bg-primary-deep p-2 pl-4 text-primary-foreground shadow-sheet">
            <span className="flex-1 text-sm font-medium">{label}</span>
            <button
              type="button"
              onClick={onDiscard}
              disabled={saving}
              className="h-11 rounded-xl px-3 text-sm font-medium text-primary-foreground/80 hover:bg-primary-foreground/10 cursor-pointer disabled:opacity-50"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="flex h-11 items-center gap-2 rounded-xl bg-sale px-4 text-sm font-semibold text-sale-foreground active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save changes
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
