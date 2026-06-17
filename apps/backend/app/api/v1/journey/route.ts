import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"

const COLLECTION = "journey";

function mapDoc(doc: FirebaseFirestore.QueryDocumentSnapshot) {
  return { id: doc.id, ...doc.data() };
}

export async function GET(request: NextRequest) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snap = await adminDb.collection(COLLECTION).get();
  const items = snap.docs
    .map(mapDoc)
    .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0) || String(a.year).localeCompare(String(b.year)));
  return NextResponse.json({ success: true, message: items });
}

export async function POST(request: NextRequest) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (!body?.title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }
    const ref = adminDb.collection(COLLECTION).doc();
    const data = {
      year: body.year ?? "",
      title: body.title,
      description: body.description ?? "",
      image: body.image ?? "",
      order: body.order ?? 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.set(data);
    return NextResponse.json({ success: true, data: { id: ref.id, ...data } }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
