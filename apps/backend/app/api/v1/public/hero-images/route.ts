import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Filter by `active` only — combining `.where()` with `.orderBy("order")`
    // would require a composite index (active, order) that isn't provisioned,
    // making the query fail with FAILED_PRECONDITION and silently fall back to
    // the bundled default slides. The result set is tiny (a handful of slides),
    // so we sort by `order` in memory instead — no index needed.
    const snap = await adminDb
      .collection("heroImages")
      .where("active", "==", true)
      .get();

    const data = snap.docs
      .map((doc) => ({
        id: doc.id,
        url: doc.data().url,
        order: doc.data().order ?? 0,
      }))
      .sort((a, b) => a.order - b.order);

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: [], error: e.message });
  }
}
