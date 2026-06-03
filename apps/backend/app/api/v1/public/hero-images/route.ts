import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await adminDb
      .collection("heroImages")
      .where("active", "==", true)
      .orderBy("order", "asc")
      .get();

    const data = snap.docs.map((doc) => ({
      id: doc.id,
      url: doc.data().url,
      order: doc.data().order,
    }));

    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: [], error: e.message });
  }
}
