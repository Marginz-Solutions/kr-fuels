import { verifySession } from "@/lib/auth/verify-session";
import { NextRequest, NextResponse } from "next/server";
import { pushImagesToStorage } from "../../route";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
    try {
        const user = await verifySession(req)

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData: FormData = await req.formData()
        const imageUrls = await pushImagesToStorage(formData, user);

        const raw = formData.get("data");

        if (raw && typeof raw === "string") {
            const { stationId } = JSON.parse(raw)
            const ref = adminDb.collection("stations").doc(stationId)
            const doc = await ref.get()
            if (!doc.exists) {
                return NextResponse.json({ error: "Station not found" }, { status: 404 });
            }
            const existing: string[] = doc.data()?.images ?? []
            await ref.update({ images: [...existing, ...imageUrls] })
        }

        return NextResponse.json({ success: true, images: imageUrls, ...(raw && { message: "Images is add to station" }) });

    }
    catch (error: any) {
        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
            },
            { status: 500 }
        );
    }
}