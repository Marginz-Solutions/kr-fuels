import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const user = await verifySession(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url)
        const limit = Math.min(Number.parseInt(searchParams.get("limit") ?? "12"),100)
        const page = Math.max(Number.parseInt(searchParams.get("page") ?? "1"),1)
        const offset = (page - 1) * limit

        // get total count
        const totalSnap = await adminDb.collection("stationImages").count().get()
        const total = totalSnap.data().count
        const totalPages = Math.ceil(total / limit)

        let query = adminDb
            .collection("stationImages")
            .orderBy("createdAt", "desc")
            .limit(limit)

        if (offset > 0) {
            // firestore offset — works but reads all skipped docs (use cursor for large datasets)
            query = query.offset(offset)
        }

        const snap = await query.get()

        const data = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }))

        return NextResponse.json({
            data,
            meta: {
                total,
                totalPages,
                page,
                limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            }
        }, { status: 200 })
    }
    catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}