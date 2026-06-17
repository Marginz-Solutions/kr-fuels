import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await adminDb.collection("journey").get();
    const items = snap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0) || String(a.year).localeCompare(String(b.year)));
    return NextResponse.json({ success: true, data: items });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: [], error: e.message });
  }
}
