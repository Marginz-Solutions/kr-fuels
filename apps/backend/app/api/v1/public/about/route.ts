import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import { ABOUT_CONTENT_DEFAULT } from "@kr/shared/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await adminDb.collection("aboutContent").doc("main").get();
    return NextResponse.json({ success: true, data: snap.exists ? snap.data() : ABOUT_CONTENT_DEFAULT });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: ABOUT_CONTENT_DEFAULT, error: e.message });
  }
}
