import { verifySession } from "@/lib/auth/verify-session"
import { adminDb } from "@/lib/firebase/admin"
import { FaqSchema } from "@kr/shared/validators/faq.schema"
import { DocumentData, FieldValue, Query } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.nextUrl)

        const user = await verifySession(req)

        if (!user) {
            return NextResponse.json({ error: "UnAuthorized User" }, { status: 401 })
        }

        const page = Math.max(Number.parseInt(searchParams.get("page") ?? "1"), 1)
        const limit = Math.min(Number.parseInt(searchParams.get("limit") ?? "10"), 100)
        const skip = (page - 1) * limit;

        const search = searchParams.get("search")

        let query: Query<DocumentData> = adminDb.collection("faqKrfuels")

        if (search) {
            const searchText = search.toLowerCase()
            console.log(searchText)
            query = query.where("normalizedQues", ">=", searchText).where("normalizedQues", "<=", searchText + "\uf8ff");
        }

        const [countSnap, paginatedSnap] = await Promise.all([
            query.count().get(),
            query.offset(skip).limit(limit).get()
        ])

        const total = countSnap.data().count
        const totalPages = Math.ceil(total / limit)

        const faqs = paginatedSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        return NextResponse.json({
            data: faqs,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            }
        })
    }
    catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500})
    }

}

export async function POST(req: NextRequest) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const body = await req.json()
        const parsed = FaqSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
                { status: 422 }
            )
        }

        const { question, answer, isLink } = parsed.data
        const now = FieldValue.serverTimestamp()

        const docRef = await adminDb.collection("faqKrfuels").add({
            question,
            answer,
            isLink: isLink ?? false,
            normalizedQues: question.toLowerCase(),
            createdAt: now,
            updatedAt: now,
        })

        return NextResponse.json(
            { data: { id: docRef.id }, message: "FAQ created successfully" },
            { status: 201 }
        )
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

