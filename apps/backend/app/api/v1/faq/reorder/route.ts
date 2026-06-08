import { verifySession } from "@/lib/auth/verify-session"
import { adminDb } from "@/lib/firebase/admin"
import { FaqReorderSchema } from "@kr/shared/validators/faq.schema"
import { FieldValue } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"
export const dynamic = "force-dynamic"

// Persist a new FAQ display order. Receives the FAQ ids in their new order and
// writes a sequential `order` value to each (offset by `startIndex` so reordering
// within a paginated page keeps the global order consistent). Static "reorder"
// segment takes precedence over the sibling "[id]" dynamic route in the app router.
export async function PATCH(req: NextRequest) {
    try {
        const user = await verifySession(req)
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 })
        }

        const body = await req.json()
        const parsed = FaqReorderSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
                { status: 422 }
            )
        }

        const { orderedIds, startIndex = 0 } = parsed.data
        const now = FieldValue.serverTimestamp()

        const batch = adminDb.batch()
        orderedIds.forEach((id, i) => {
            const ref = adminDb.collection("faqKrfuels").doc(id)
            batch.update(ref, { order: startIndex + i, updatedAt: now })
        })
        await batch.commit()

        return NextResponse.json({ message: "FAQ order updated successfully" })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
