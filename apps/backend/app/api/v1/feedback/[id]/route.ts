import { verifySession } from "@/lib/auth/verify-session"
import { adminDb } from "@/lib/firebase/admin"
import { FeedbackPatchSchema } from "@kr/shared/validators/feedback.schema"
import { FieldValue } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"
import { Params } from "../../stations/[id]/route"
export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: Params ) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const { id } = await params
        const docRef  = adminDb.collection("feedbacks").doc(id)
        const docSnap = await docRef.get()

        if (!docSnap.exists) {
            return NextResponse.json({ error: "Feedback not found" }, { status: 404 })
        }

        const body   = await req.json()
        const parsed = FeedbackPatchSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
                { status: 422 }
            )
        }

        await docRef.update({
            ...parsed.data,
            updatedAt: FieldValue.serverTimestamp(),
        })

        return NextResponse.json({ message: "Feedback updated successfully" })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}



export async function DELETE(req: NextRequest, { params }: Params ) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const { id } = await params
        const docRef  = adminDb.collection("feedbacks").doc(id)
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