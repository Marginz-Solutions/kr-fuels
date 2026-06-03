import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
export const dynamic = "force-dynamic"

// Shared cookie attributes. In production set COOKIE_DOMAIN to the parent
// domain (e.g. .krfuels.com) so the `session` cookie is both stored by the
// API host and readable by the admin host's proxy/middleware.
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  domain: COOKIE_DOMAIN,
};

// Allowlist: only these emails may obtain an admin session. Firebase Auth
// auto-creates a user for any Google account on first sign-in, so verifying the
// token alone is not enough — we gate on email here. Fail closed: an unset or
// empty allowlist rejects everyone rather than silently letting anyone in.
const ADMIN_ALLOWLIST = new Set(
  (process.env.ADMIN_ALLOWLIST ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

export async function POST(req: NextRequest) {
  let idToken: string | undefined;
  try {
    ({ idToken } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    if (ADMIN_ALLOWLIST.size === 0) {
      console.error("ADMIN_ALLOWLIST is not configured — rejecting all admin logins.");
      return NextResponse.json({ error: "not-authorized" }, { status: 403 });
    }

    // Verify the token first so we can read the (Firebase-validated) email,
    // then enforce the allowlist before minting a session cookie.
    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();
    if (!email || !ADMIN_ALLOWLIST.has(email)) {
      return NextResponse.json({ error: "not-authorized" }, { status: 403 });
    }

    // Create a session cookie (14 days)
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: "success" });
    response.cookies.set("session", sessionCookie, {
      ...baseCookie,
      maxAge: expiresIn / 1000,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: "success" });
  // Overwrite with an expired cookie carrying the same attributes so it is
  // reliably cleared (a bare delete() can miss when a domain is set).
  response.cookies.set("session", "", { ...baseCookie, maxAge: 0 });
  return response;
}