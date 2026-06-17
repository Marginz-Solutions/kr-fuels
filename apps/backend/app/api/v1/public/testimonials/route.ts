import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PUBLIC. Active testimonials for the website carousel.
export async function GET() {
  try {
    const snap = await adminDb.collection("testimonials").where("isActive", "==", true).get();
    const items = snap.docs
      .map((doc) => {
        const d = doc.data();
        return { id: doc.id, ...d, createdAt: d.createdAt?.toDate?.()?.toISOString() ?? null };
      })
      .sort((a: any, b: any) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? "")));
    return NextResponse.json({ success: true, data: items });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: [], error: e.message });
  }
}
