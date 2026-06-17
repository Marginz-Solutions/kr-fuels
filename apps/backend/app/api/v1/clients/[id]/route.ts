import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { ClientPatchSchema } from "@kr/shared/validators/clients.schema";
export const dynamic = "force-dynamic"

interface Params {
  params: Promise<{ id: string }>;
}

const COLLECTION = "clients";

// PATCH /api/v1/clients/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const user = await verifySession(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const ref = adminDb.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = ClientPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const updatedData = { ...parsed.data, updatedAt: FieldValue.serverTimestamp() };
    await ref.update(updatedData);

    return NextResponse.json(
      { success: true, message: "Client updated", data: { id, ...parsed.data } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("UPDATE CLIENT ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to update client" }, { status: 500 });
  }
}

// DELETE /api/v1/clients/[id]
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await verifySession(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const ref = adminDb.collection(COLLECTION).doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ success: false, error: "Client not found" }, { status: 404 });
    }

    await ref.delete();
    return NextResponse.json({ success: true, message: "Client deleted" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE CLIENT ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to delete client" }, { status: 500 });
  }
}
