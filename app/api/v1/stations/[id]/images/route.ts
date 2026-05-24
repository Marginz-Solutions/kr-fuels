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

    const ref = adminDb.collection("stations").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
        return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
    const filePath = decodeURIComponent(imageUrl.split(`${bucket.name}/`)[1]);
    await bucket.file(filePath).delete();
    await ref.update({ images: FieldValue.arrayRemove(imageUrl) });

    return NextResponse.json({ success: true });
}