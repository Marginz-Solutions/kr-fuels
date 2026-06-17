import { verifySession } from "@/lib/auth/verify-session"
import { adminDb } from "@/lib/firebase/admin"
import { FaqSchema } from "@kr/shared/validators/faq.schema"
import { DocumentData, FieldValue } from "firebase-admin/firestore"
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

        const search = (searchParams.get("search") ?? "").trim().toLowerCase()

        // FAQs are a small collection, and they must be returned in their manual
        // `order` (which Firestore can't combine with text search without a composite
        // index, and orderBy would silently drop any doc missing the field). So we
        // read all, then sort / filter / paginate in memory \u2014 robust and cheap here.
        const snap = await adminDb.collection("faqKrfuels").get()
        let all = snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) }))

        // Manual order first; docs without an order fall to the end, tie-broken by createdAt.
        all.sort((a: any, b: any) => {
            const ao = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER
            const bo = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER
            if (ao !== bo) return ao - bo
            return (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0)
        })

        if (search) {
            all = all.filter((f: any) =>
                (f.normalizedQues ?? f.question?.toLowerCase() ?? "").includes(search)
            )
        }

        const total = all.length
        const totalPages = Math.ceil(total / limit)
        const faqs = all.slice(skip, skip + limit)

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

        // Append new FAQs at the end: order = (current max order) + 1.
        const existing = await adminDb.collection("faqKrfuels").get()
        let maxOrder = -1
        existing.forEach(d => {
            const o = d.data().order
            if (typeof o === "number" && o > maxOrder) maxOrder = o
        })

        const docRef = await adminDb.collection("faqKrfuels").add({
            question,
            answer,
            isLink: isLink ?? false,
            order: maxOrder + 1,
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

