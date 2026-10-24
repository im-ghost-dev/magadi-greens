import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { ADMIN_COOKIE, getAdminPassword } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

/* ---- brute-force protection: 5 wrong tries per IP, then a 15 minute lock ---- */
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const fails = new Map<string, { n: number; until: number }>();

function clientIp(req: Request): string {
  return (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Compares two strings in constant time (hashes first so lengths always match). */
function sameSecret(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

async function isValidSession(token: string | undefined) {
  if (!token) return false;
  const session = await db.adminSession.findUnique({ where: { token: token } });
  if (!session) return false;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.adminSession.delete({ where: { token } }).catch(() => {});
    return false;
  }
  return true;
}

/** GET /api/admin/login – check whether the current cookie is a valid session. */
export async function GET() {
  const store = await cookies();
  const ok = await isValidSession(store.get(ADMIN_COOKIE)?.value);
  return NextResponse.json({ ok });
}

/**
 * POST /api/admin/login
 * Body: { password: string, remember?: boolean }
 * The password comes only from the ADMIN_PASSWORD environment variable.
 * Sets an httpOnly cookie with a session token on success.
 */
export async function POST(req: Request) {
  const secret = getAdminPassword();
  if (!secret) {
    console.error("ADMIN_PASSWORD is not set (or is shorter than 8 characters). Admin login is disabled.");
    return NextResponse.json({ error: "Admin login isn't set up on the server yet." }, { status: 503 });
  }

  const ip = clientIp(req);
  const rec = fails.get(ip);
  if (rec && rec.until > Date.now() && rec.n >= MAX_FAILS) {
    const mins = Math.ceil((rec.until - Date.now()) / 60000);
    return NextResponse.json({ error: `Too many wrong attempts. Try again in ${mins} minute${mins > 1 ? "s" : ""}.` }, { status: 429 });
  }

  let body: { password?: string; remember?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password.trim() : "";
  if (!password) {
    return NextResponse.json({ error: "Enter the admin password" }, { status: 400 });
  }
  if (!sameSecret(password, secret)) {
    const n = (rec && rec.until > Date.now() ? rec.n : 0) + 1;
    fails.set(ip, { n, until: Date.now() + LOCK_MS });
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  fails.delete(ip);

  // Create a session token. Keep it for 30 days (or 1 day if not "remember").
  const token = crypto.randomUUID() + crypto.randomUUID();
  const days = body.remember ? 30 : 1;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  await db.adminSession.create({ data: { token, expiresAt } });

  const store = await cookies();
  store.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/login – clears the admin session (logout). */
export async function DELETE() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (token) {
    await db.adminSession.deleteMany({ where: { token } }).catch(() => {});
    store.delete(ADMIN_COOKIE);
  }
  return NextResponse.json({ ok: true });
}
