import { verifySession } from "@/lib/auth/verify-session"
import { adminDb } from "@/lib/firebase/admin"
import { FieldValue } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"
import {
    AdminContactEssentialsSchema,
    AdminContactEssentialsPatchSchema
} from "@kr/shared/validators/admin-contact.schema"

export const dynamic = "force-dynamic"

const DOC_REF = () => adminDb.collection("adminContactDetails").doc("essentials")

export async function GET(req: NextRequest) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const docSnap = await DOC_REF().get()

        if (!docSnap.exists) {
            return NextResponse.json({ error: "Essentials not found" }, { status: 404 })
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
        const parsed = AdminContactEssentialsPatchSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
                { status: 422 }
            )
        }

        const docSnap = await DOC_REF().get()

        if (docSnap.exists) {
            await DOC_REF().update({
                ...flattenObject(parsed.data),
                updatedAt: FieldValue.serverTimestamp(),
            })
        } else {
            // first time setup — validate full schema before creating
            const fullParsed = AdminContactEssentialsSchema.safeParse(body)
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

        return NextResponse.json({ message: "Essentials updated successfully" })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

export function flattenObject(obj: Record<string, any>, prefix = ""): Record<string, any> {
    return Object.keys(obj).reduce((acc, key) => {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (
            typeof obj[key] === "object" &&
            obj[key] !== null &&
            !Array.isArray(obj[key]) &&
            !(obj[key] instanceof Date)
        ) {
            Object.assign(acc, flattenObject(obj[key], fullKey))
        } else {
            acc[fullKey] = obj[key]
        }
        return acc
    }, {} as Record<string, any>)
}