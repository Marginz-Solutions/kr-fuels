import { adminDb } from "@/lib/firebase/admin";
import { normalizeStation } from "@/lib/normalize/station";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ id: string }>;
}

// PUBLIC. Single station detail for the website. Returns the SAME normalized shape as
// the list route so a station reached from the list resolves to identical fields.
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const snap = await adminDb.collection("stations").doc(id).get();
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: "Station not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: normalizeStation(snap.id, snap.data() ?? {}) });
  } catch (e: any) {
    // Degrade gracefully (200 + null) like the other public endpoints; the website
    // then uses its fallback or shows 404 instead of a 500.
    console.error("PUBLIC STATION DETAIL ERROR:", e?.message ?? e);
    return NextResponse.json({ success: false, data: null });
  }
}
