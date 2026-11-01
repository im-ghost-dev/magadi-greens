import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { requireAdmin, getAdminPassword } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

function sameSecret(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * POST /api/admin/password (admin only)
 * Body: { currentPassword: string, newPassword: string }
 * Changes the admin password and stores it in database Settings.
 */
export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword.trim() : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword.trim() : "";

  if (!currentPassword) {
    return NextResponse.json({ error: "Please enter your current password" }, { status: 400 });
  }
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters long" },
      { status: 400 },
    );
  }

  const activePassword = await getAdminPassword();
  if (!activePassword || !sameSecret(currentPassword, activePassword)) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
  }

  await db.settings.upsert({
    where: { id: 1 },
    create: { id: 1, adminPassword: newPassword },
    update: { adminPassword: newPassword },
  });

  return NextResponse.json({ ok: true, message: "Admin password updated successfully." });
}
