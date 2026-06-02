import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { CALCULATOR_SETTINGS_DEFAULT } from "@kr/shared/types";
export const dynamic = "force-dynamic"

const docRef = () => adminDb.collection("calculatorSettings").doc("main");

export async function GET(request: NextRequest) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snap = await docRef().get();
  return NextResponse.json({ success: true, data: snap.exists ? snap.data() : CALCULATOR_SETTINGS_DEFAULT });
}

export async function PUT(request: NextRequest) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    await docRef().set({ ...body, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    return NextResponse.json({ success: true, message: "Calculator settings saved" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
