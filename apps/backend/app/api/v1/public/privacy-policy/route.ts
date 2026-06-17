import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PUBLIC. Privacy policy content for /privacy.
export async function GET() {
  try {
    const snap = await adminDb.collection("privacyPolicy").get();
    const docs = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        publishedAt: d.publishedAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });
    const policy = docs.find((d: any) => d.status === "published") ?? docs[0] ?? null;
    return NextResponse.json({ success: true, data: policy });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: null, error: e.message });
  }
}
