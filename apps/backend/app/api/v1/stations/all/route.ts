import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
    try {
        const user = await verifySession(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const stationsSnap = await adminDb.collection("stations").select("stationName" , "images").get()

        const payload = stationsSnap.docs.map(doc => ({
            id: doc.id,                        // ← from doc.id
            stationName: doc.data().stationName,
            images: doc.data().images,
            imageCount: doc.data().images?.length ?? 0
        }))

        return NextResponse.json({ data: payload }, { status: 200 })
    }
    catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }

}