"use client";

import { create } from "zustand";

type AdminState = {
  /** Whether the client has confirmed with the server that the cookie is valid. */
  authed: boolean;
  /** "unknown" until the first GET /api/admin/login resolves. */
  status: "unknown" | "checking" | "authed" | "guest";
  setAuthed: (v: boolean) => void;
  setStatus: (s: AdminState["status"]) => void;
  logout: () => Promise<void>;
};

export const useAdmin = create<AdminState>((set) => ({
  authed: false,
  status: "unknown",
  setAuthed: (v) => set({ authed: v, status: v ? "authed" : "guest" }),
  setStatus: (s) => set({ status: s }),
  logout: async () => {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch {
      /* ignore – the cookie is gone either way */
    }
    set({ authed: false, status: "guest" });
  },
}));
