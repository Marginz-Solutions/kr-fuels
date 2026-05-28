import { verifySession } from "@/lib/auth/verify-session"
import { adminDb } from "@/lib/firebase/admin"
import { DocumentData, FieldValue, Query } from "firebase-admin/firestore"
import { NextRequest, NextResponse } from "next/server"
import { FeedbackSchema, FeedbackPatchSchema } from "@/lib/validators/feedback.schema"

// GET /api/feedback
export async function GET(req: NextRequest) {
    try {
        const user = await verifySession(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
        }

        const { searchParams } = new URL(req.nextUrl);

        const page = Math.max(Number.parseInt(searchParams.get("page") ?? "1"), 1);
        const limit = Math.min(Number.parseInt(searchParams.get("limit") ?? "10"), 100);
        const skip = (page - 1) * limit;

        const status = searchParams.get("status");
        const category = searchParams.get("category");
        const stationId = searchParams.get("stationId");

        let query: Query<DocumentData> = adminDb.collection("feedbacks");

        if (status) query = query.where("status", "==", status);
        if (category) query = query.where("category", "==", category);
        if (stationId) query = query.where("stationId", "==", stationId);

        const [countSnap, paginatedSnap] = await Promise.all([
            query.count().get(),
            query.orderBy("createdAt", "desc").offset(skip).limit(limit).get(),
        ]);

        const total = countSnap.data().count;
        const totalPages = Math.ceil(total / limit);

        const feedbackDocs = paginatedSnap.docs;

        // ✅ Step 1: collect unique stationIds
        const stationIds = [
            ...new Set(
                feedbackDocs
                    .map((doc) => {
                        const stationId = doc.data().stationId;

                        // handle DocumentReference case
                        if (stationId && typeof stationId === "object" && "id" in stationId) {
                            return stationId.id;
                        }

                        // handle string case
                        if (typeof stationId === "string" && stationId.trim() !== "") {
                            return stationId;
                        }

                        return null;
                    })
                    .filter((id): id is string => !!id)
            ),
        ];

        // ✅ Step 2: fetch stations in parallel
        let stationMap: Record<string, string> = {};

        if (stationIds.length > 0) {
            const stationSnaps = await Promise.all(
                stationIds.map((id) =>
                    adminDb.collection("stations").doc(id).get()
                )
            );

            stationMap = stationSnaps.reduce((acc, snap) => {
                if (snap.exists) {
                    acc[snap.id] = snap.data()?.stationName ?? "Unknown";
                }
                return acc;
            }, {} as Record<string, string>);
        }

        // ✅ Step 3: attach stationName
        const feedbacks = feedbackDocs.map((doc) => {
            const data = doc.data();

            let stationId = data.stationId;

            // ✅ normalize DocumentReference → string
            if (stationId && typeof stationId === "object" && "id" in stationId) {
                stationId = stationId.id;
            }

            // ✅ normalize string
            if (typeof stationId !== "string") {
                stationId = null;
            }

            return {
                id: doc.id,
                ...data,
                stationId,
                stationName: stationId ? stationMap[stationId] ?? null : null,
            };
        });

        return NextResponse.json({
            data: feedbacks,
            meta: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}



export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const parsed = FeedbackSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
                { status: 422 }
            )
        }

        const now = FieldValue.serverTimestamp()

        const docRef = await adminDb.collection("feedbacks").add({
            ...parsed.data,
            status: parsed.data.status ?? "pending",
            createdAt: now,
            updatedAt: now,
        })

        return NextResponse.json(
            { data: { id: docRef.id }, message: "Feedback submitted successfully" },
            { status: 201 }
        )
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

