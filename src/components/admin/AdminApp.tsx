"use client";

import { useAdmin } from "@/store/useAdmin";
import { AdminLogin } from "./AdminLogin";
import { AdminPanel } from "./AdminPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Props = {
  onExit: () => void;
  onSaved: () => void;
};

/** Decides between the login screen and the admin panel. */
export function AdminApp({ onExit, onSaved }: Props) {
  const authed = useAdmin((s) => s.authed);
  const status = useAdmin((s) => s.status);

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
          <AdminPanel onSaved={onSaved} />
        ) : (
          <AdminLogin />
        )}
      </div>
    </div>
  );
}
