import { verifySession } from "@/lib/auth/verify-session"
import { adminDb } from "@/lib/firebase/admin"
import { NextRequest, NextResponse } from "next/server"
import { Params } from "../../stations/[id]/route"
export const dynamic = "force-dynamic"

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const { id } = await params
        const docRef  = adminDb.collection("enquiryDetails").doc(id)
        const docSnap = await docRef.get()

        if (!docSnap.exists) {
            return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
        }

        await docRef.delete()

        return NextResponse.json({ message: "Feedback deleted successfully" })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}