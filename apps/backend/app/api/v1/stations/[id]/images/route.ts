import { verifySession } from "@/lib/auth/verify-session";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { Params } from "../route";
export const dynamic = "force-dynamic"

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

    await Promise.all([
        ref.update({ images: FieldValue.arrayRemove(imageUrl) }),

        // Find the stationImage doc by stationId and url, then reset
        adminDb.collection("stationImages")
            .where("stationId", "==", id)
            .where("url", "==", imageUrl)
            .get()
            .then(snap => {
                if (!snap.empty) {
                    const batch = adminDb.batch()
                    snap.docs.forEach(doc => batch.update(doc.ref, { stationId: null }))
                    return batch.commit()
                }
            })
    ])

    return NextResponse.json({ success: true });
}