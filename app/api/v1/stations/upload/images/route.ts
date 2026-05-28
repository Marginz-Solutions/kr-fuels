import { verifySession } from "@/lib/auth/verify-session";
import { NextRequest, NextResponse } from "next/server";
import { pushImagesToStorage } from "../../route";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
    try {
        const user = await verifySession(req)

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData: FormData = await req.formData()
        const imageUrls = await pushImagesToStorage(formData, user);

        const raw = formData.get("data");
        
        const stationId = raw && typeof raw === "string"
            ? JSON.parse(raw).stationId
            : null

        // save each image to stationImages collection
        const batch = adminDb.batch()

        const savedImages = imageUrls.map((url: string) => {
            const ref = adminDb.collection("stationImages").doc()
            const payload = {
                id:         ref.id,
                url,
                stationId:  stationId ?? null,
                uploadedBy: user.uid,
                createdAt:  FieldValue.serverTimestamp(),
            }
            batch.set(ref, payload)
            return { ...payload }
        })

        // if stationId provided, update station's images array too
        if (stationId) {
            const stationRef = adminDb.collection("stations").doc(stationId)
            const stationDoc = await stationRef.get()

            if (!stationDoc.exists) {
                return NextResponse.json({ error: "Station not found" }, { status: 404 });
            }

            const existing: string[] = stationDoc.data()?.images ?? []
            batch.update(stationRef, { images: [...existing, ...imageUrls] })
        }

        await batch.commit()

        return NextResponse.json({
            success: true,
            images:  savedImages,
            ...(stationId && { message: "Images added to station" })
        }, { status: 201 })
    }
    catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}