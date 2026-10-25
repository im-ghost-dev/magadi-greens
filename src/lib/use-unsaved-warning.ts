"use client";

import { useEffect } from "react";

/**
 * Warns the user before they leave/refresh the tab while `dirty` is true.
 * Used by the admin screens so unsaved edits aren't lost accidentally.
 */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Required for the native "Leave site?" prompt in most browsers.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
