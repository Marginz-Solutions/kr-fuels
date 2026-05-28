import { verifySession } from "@/lib/auth/verify-session";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { Params } from "../route";

export async function DELETE(request: NextRequest, { params }: Params) {
    const { id } = await params;

    const user = await verifySession(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl } = await request.json();
    console.log(imageUrl)

    const ref = adminDb.collection("stations").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
        return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    ref.update({ images: FieldValue.arrayRemove(imageUrl) })

    return NextResponse.json({ success: true });
}