import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";
import { SITE_SETTINGS_DEFAULT } from "@kr/shared/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snap = await adminDb.collection("siteSettings").doc("main").get();
    return NextResponse.json({ success: true, data: snap.exists ? snap.data() : SITE_SETTINGS_DEFAULT });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: SITE_SETTINGS_DEFAULT, error: e.message });
  }
}
