import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const ref = adminDb.collection("journey").doc(id);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ success: false, error: "Milestone not found" }, { status: 404 });
    }
    const body = await request.json();
    await ref.update({ ...body, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true, data: { id, ...body } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const ref = adminDb.collection("journey").doc(id);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ success: false, error: "Milestone not found" }, { status: 404 });
    }
    await ref.delete();
    return NextResponse.json({ success: true, message: "Milestone deleted" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
