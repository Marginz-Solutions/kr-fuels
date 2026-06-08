import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PUBLIC. FAQ entries for the Guide page.
// Reads the SAME collection the admin writes to ("faqKrfuels"), so edits made in
// the admin panel show up on the public site. (Previously read "faq", which the
// admin never wrote to — hence admin FAQ changes never appeared here.)
export async function GET() {
  try {
    const snap = await adminDb.collection("faqKrfuels").get();
    // Sort oldest-first in memory rather than via orderBy("createdAt"), so any FAQ
    // missing a createdAt field is still returned (Firestore's orderBy drops them).
    const items = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => {
        const at = a.createdAt?.toMillis?.() ?? 0;
        const bt = b.createdAt?.toMillis?.() ?? 0;
        return at - bt;
      });
    return NextResponse.json({ success: true, data: items });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: [], error: e.message });
  }
}
