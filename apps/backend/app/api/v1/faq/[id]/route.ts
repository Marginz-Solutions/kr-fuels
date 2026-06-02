import { verifySession } from "@/lib/auth/verify-session"
import { adminDb } from "@/lib/firebase/admin"
import { FaqPatchSchema } from "@kr/shared/validators/faq.schema"
import { FieldValue } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"
import { Params } from "../../stations/[id]/route"
export const dynamic = "force-dynamic"

export async function PATCH(req: NextRequest, { params }: Params) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const { id } = await params
        const docRef = adminDb.collection("faqKrfuels").doc(id)
        const docSnap = await docRef.get()

        if (!docSnap.exists) {
            return NextResponse.json({ error: "FAQ not found" }, { status: 404 })
        }

        const body = await req.json()
        const parsed = FaqPatchSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
                { status: 422 }
            )
        }

        const { question, answer, isLink } = parsed.data

        const updatePayload: Record<string, any> = {
            updatedAt: FieldValue.serverTimestamp(),
        }

        if (question !== undefined) {
            updatePayload.question = question
            updatePayload.normalizedQues = question.toLowerCase() // keep in sync
        }
        if (answer !== undefined) updatePayload.answer = answer
        if (isLink !== undefined) updatePayload.isLink = isLink

        await docRef.update(updatePayload)

        return NextResponse.json({ message: "FAQ updated successfully" })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const { id } =await params
        const docRef = adminDb.collection("faqKrfuels").doc(id)
        const docSnap = await docRef.get()

        if (!docSnap.exists) {
            return NextResponse.json({ error: "FAQ not found" }, { status: 404 })
        }

        await docRef.delete()

        return NextResponse.json({ message: "FAQ deleted successfully" })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}