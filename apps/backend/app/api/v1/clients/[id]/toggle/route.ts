import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/v1/clients/[id]/toggle — flip active flag
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await verifySession(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const ref = adminDb.collection("clients").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const next = !(doc.data()?.active ?? true);
    await ref.update({ active: next, updatedAt: FieldValue.serverTimestamp() });

    return NextResponse.json({ success: true, data: { id, active: next } }, { status: 200 });
  } catch (error: any) {
    console.error("TOGGLE CLIENT ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to toggle client" }, { status: 500 });
  }
}
