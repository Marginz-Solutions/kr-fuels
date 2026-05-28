import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { Params } from "../../route";

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await verifySession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =await params;

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { imageUrls } = body;

    if (!Array.isArray(imageUrls) || imageUrls.some(url => typeof url !== "string")) {
      return NextResponse.json(
        { error: "imageUrls must be an array of strings" },
        { status: 400 }
      );
    }

    const ref = adminDb.collection("stations").doc(id);
    const doc = await ref.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    // ✅ safer: atomic update (prevents race conditions)
    await ref.update({
      images:FieldValue.arrayUnion(...imageUrls),
    });

    const updatedDoc = await ref.get();

    return NextResponse.json({
      success: true,
      urls: updatedDoc.data()?.images || [],
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: error.status || 500 }
    );
  }
}