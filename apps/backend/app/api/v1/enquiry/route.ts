import { verifySession } from "@/lib/auth/verify-session"
import { adminDb } from "@/lib/firebase/admin"
import { FieldValue } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"
import { EnquirySchema } from "@kr/shared/validators/enquiry.schema"
export const dynamic = "force-dynamic"

// GET /api/feedback
export async function GET(req: NextRequest) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const { searchParams } = new URL(req.nextUrl)

        const page  = Math.max(Number.parseInt(searchParams.get("page")  ?? "1"),   1)
        const limit = Math.min(Number.parseInt(searchParams.get("limit") ?? "10"), 100)
        const skip  = (page - 1) * limit

        // Same orderBy on the count as the list so the total matches the rows
        // returned (docs without `createdAt` are excluded from both).
        const orderedQuery = adminDb
            .collection("enquiryDetails")
            .orderBy("createdAt", "desc")

        const [countSnap, paginatedSnap] = await Promise.all([
            orderedQuery.count().get(),
            orderedQuery.offset(skip).limit(limit).get(),
        ])

        const total      = countSnap.data().count
        const totalPages = Math.ceil(total / limit)

        const enquiries = paginatedSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }))

        return NextResponse.json({
            data: enquiries,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}


// POST /api/feedback  (public — no auth required for submitting feedback)
export async function POST(req: NextRequest) {
    try {
        const body   = await req.json()
        const parsed = EnquirySchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
                { status: 422 }
            )
        }

        const { name, email, phone, message } = parsed.data

        const docRef = await adminDb.collection("enquiryDetails").add({
            name,
            email,
            phone,
            message,
            createdAt: FieldValue.serverTimestamp(),
        })

        return NextResponse.json(
            { data: { id: docRef.id }, message: "Feedback submitted successfully" },
            { status: 201 }
        )
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

