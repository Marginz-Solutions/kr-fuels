import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PUBLIC. FAQ entries for the Guide page.
export async function GET() {
  try {
    const snap = await adminDb.collection("faq").get();
    const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ success: true, data: items });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: [], error: e.message });
  }
}
