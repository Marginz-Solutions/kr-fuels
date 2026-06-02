import { verifySession } from "@/lib/auth/verify-session"
import { adminDb } from "@/lib/firebase/admin"
import { FieldValue } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"
import {
    AdminContactPresentsSchema,
    AdminContactPresentsPatchSchema
} from "@kr/shared/validators/admin-contact.schema"
import { flattenObject } from "../essentials/route"
export const dynamic = "force-dynamic"

const DOC_REF = () => adminDb.collection("adminContactDetails").doc("presents")

export async function GET(req: NextRequest) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const docSnap = await DOC_REF().get()

        if (!docSnap.exists) {
            return NextResponse.json({ error: "Presents not found" }, { status: 404 })
        }

        return NextResponse.json({ data: { id: docSnap.id, ...docSnap.data() } })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}


export async function PATCH(req: NextRequest) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const body   = await req.json()
        console.log(body)
        const parsed = AdminContactPresentsPatchSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
                { status: 422 }
            )
        }

        const docSnap = await DOC_REF().get()

        if (docSnap.exists) {
            console.log(parsed.data)
            await DOC_REF().update({
                ...flattenObject(parsed.data),
                updatedAt: FieldValue.serverTimestamp(),
            })
        } else {
            const fullParsed = AdminContactPresentsSchema.safeParse(body)
           
            if (!fullParsed.success) {
                return NextResponse.json(
                    { error: "Full data required for first time setup", issues: fullParsed.error.flatten().fieldErrors },
                    { status: 422 }
                )
            }
            await DOC_REF().set({
                ...fullParsed.data,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            })
        }

        return NextResponse.json({ message: "Presents updated successfully",data:{...body} })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}