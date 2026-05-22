import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const user = await verifySession(request)

    console.log(user)

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const data = await adminDb.collection("stations").get()
    const snap = data.docs
    const response = snap.map(sn => sn.data())

    return NextResponse.json({ message: response })
}