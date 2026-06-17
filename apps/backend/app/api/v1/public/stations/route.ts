import { adminDb } from "@/lib/firebase/admin";
import { normalizeStation } from "@/lib/normalize/station";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PUBLIC. Active stations for the website list/filters + the dynamic "81+" count.
// Lenient on status: include every station that is NOT explicitly "inactive"
// (so docs with a missing/legacy status field still show on the website).
// Each doc is mapped to ONE clean public contract (see normalizeStation) so the
// website never has to guess between location.lat/lng vs latitude/longitude etc.
export async function GET() {
  try {
    const snap = await adminDb.collection("stations").get();
    const stations = snap.docs
      .map((doc) => normalizeStation(doc.id, doc.data()))
      .filter((s) => s.status.toLowerCase() !== "inactive");

    const districts = Array.from(
      new Set(stations.map((s) => s.district).filter(Boolean))
    ).sort();

    return NextResponse.json({ success: true, data: stations, total: stations.length, districts });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: [], total: 0, districts: [], error: e.message });
  }
}
