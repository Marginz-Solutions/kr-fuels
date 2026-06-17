import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const COLLECTION = "heroImages";

export async function GET(request: NextRequest) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const snap = await adminDb.collection(COLLECTION).orderBy("order", "asc").get();
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
    }));
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { url, order, active = true } = body;
    if (!url) return NextResponse.json({ success: false, error: "url is required" }, { status: 400 });

    const countSnap = await adminDb.collection(COLLECTION).count().get();
    const nextOrder = typeof order === "number" ? order : countSnap.data().count;

    const ref = adminDb.collection(COLLECTION).doc();
    const data = {
      url,
      order: nextOrder,
      active,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: user.uid,
    };
    await ref.set(data);
    return NextResponse.json({ success: true, data: { id: ref.id, url, order: nextOrder, active } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
