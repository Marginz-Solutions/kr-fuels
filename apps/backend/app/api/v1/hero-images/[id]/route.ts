import { verifySession } from "@/lib/auth/verify-session";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

interface Params { params: Promise<{ id: string }> }

const COLLECTION = "heroImages";

function extractStoragePath(url: string): string | null {
  const match = url.match(/storage\.googleapis\.com\/[^/]+\/(.+?)(?:\?|$)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const ref = adminDb.collection(COLLECTION).doc(id);
    if (!(await ref.get()).exists)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const body = await request.json();
    const allowed: Record<string, any> = {};
    if (typeof body.order === "number") allowed.order = body.order;
    if (typeof body.active === "boolean") allowed.active = body.active;
    if (typeof body.url === "string") allowed.url = body.url;

    await ref.update({ ...allowed, updatedAt: FieldValue.serverTimestamp() });
    return NextResponse.json({ success: true, data: { id, ...allowed } });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const ref = adminDb.collection(COLLECTION).doc(id);
    const snap = await ref.get();
    if (!snap.exists)
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    const { url } = snap.data() as { url: string };

    // Delete from Firebase Storage (non-fatal if already gone).
    const storagePath = extractStoragePath(url);
    if (storagePath) {
      try {
        await adminStorage.bucket().file(storagePath).delete();
      } catch (e: any) {
        if (e?.code !== 404) console.error("Storage delete error (non-fatal):", e?.message);
      }
    }

    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
