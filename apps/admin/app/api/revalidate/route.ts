import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Same-origin endpoint the admin client pings after a content change. It forwards
// the purge to the public site server-side, keeping the shared secret out of the
// browser. Best-effort: a slow or unreachable public site never hangs a save.
export async function POST() {
  const base = process.env.USER_ORIGIN;
  const secret = process.env.REVALIDATE_SECRET;

  // Not configured (e.g. local without the public site running) → no-op.
  if (!base || !secret) {
    return NextResponse.json({ skipped: "not-configured" });
  }

  try {
    await fetch(`${base}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": secret },
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* best-effort — time-based revalidation is the fallback */
  }

  return NextResponse.json({ ok: true });
}
