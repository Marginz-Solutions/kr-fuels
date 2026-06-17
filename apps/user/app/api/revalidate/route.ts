import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

// On-demand cache purge. The admin pings this (server-to-server, carrying the
// shared secret) immediately after a content change, so the public site reflects
// edits right away instead of waiting out the time-based `revalidate` windows in
// lib/api.ts. Purging the root layout refreshes every page and its data in one go.
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided = req.headers.get("x-revalidate-secret");

  // If no secret is configured, refuse rather than expose an open purge endpoint.
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true });
}
