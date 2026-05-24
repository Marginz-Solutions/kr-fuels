import { verifySession } from "@/lib/auth/verify-session";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
import { pushImagesToStorage } from "../../../route";
import { FieldValue } from "firebase-admin/firestore";
import { Params } from "../../route";


export async function POST(req: NextRequest, { params }: Params) {
    try {
        const { id } = await params;
        const user = await verifySession(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const ref = adminDb.collection("stations").doc(id)
        const doc = await ref.get()
        if (!doc.exists) {
            return NextResponse.json({ error: "Station not found" }, { status: 404 });
        }
        const formData = await req.formData()
        const imageUrls = await pushImagesToStorage(formData, user)
        await ref.update({ images: FieldValue.arrayUnion(...imageUrls) })
        return NextResponse.json({ success: true, images: imageUrls });
    } catch (error: any) {
        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
            },
            { status: 500 }
        );
    }

}


