import { verifySession } from "@/lib/auth/verify-session";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { TestimonialSchema } from "@/lib/validators/testimonial.schema";
import { DocumentData, FieldValue, Query } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const user = await verifySession(req);
    if (!user) {
        return NextResponse.json({ error: "UnAuthorized User" }, { status: 401 })
    }
    const { searchParams } = new URL(req.nextUrl);
    const page = Math.max(Number.parseInt(searchParams.get("page") ?? "1"), 1)
    const limit = Math.min(Number.parseInt(searchParams.get("limit") ?? "10"), 100)
    const skip = (page - 1) * limit;

    const search = searchParams.get("search")

    let query: Query<DocumentData> = adminDb.collection("testimonials")

    if (search) {
        query = query.where("name", ">=", search).where("name", "<=", search + "\uf8ff")
    }

    const [countSnap, paginatedSnap] = await Promise.all([
        query.count().get(),
        query.orderBy("name").offset(skip).limit(limit).get()
    ])

    const total = countSnap.data().count;
    const totalPages = Math.ceil(total / limit);

    const testimonials = paginatedSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }))

    return NextResponse.json({
        data: testimonials,
        meta: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    })

}

export async function POST(req: NextRequest) {
    try {
        const user = await verifySession(req);
        if (!user) {
            return NextResponse.json({ error: "UnAuthorized User" }, { status: 401 })
        }

        const formData: FormData = await req.formData()
        const raw = formData.get("data")

        if (!raw || typeof raw !== "string") {
            return NextResponse.json({ error: "Missing station data" }, { status: 400 });
        }
        let body;
        try {
            body = JSON.parse(raw);
        }
        catch {
            return NextResponse.json({ error: "Invalid JSON in data field" }, { status: 400 });
        }

        const result = TestimonialSchema.safeParse(body)
        if (!result.success) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    issues: result.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const imageFile = formData.get("image") as File
        let imageUrl: string | undefined;
        if (imageFile) {
            const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET)

            const buffer = Buffer.from(await imageFile.arrayBuffer())
            const ext = imageFile.name.split(".").pop()
            const fileName = `testimonials/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
            const fileRef = bucket.file(fileName)

            await fileRef.save(buffer, {
                metadata: {
                    contentType: imageFile.type,
                    metadata: { uploadedBy: user?.uid }
                }
            })

            await fileRef.makePublic()
            imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        }

        const now = FieldValue.serverTimestamp()

        const docData = {
            ...result.data,
            ...(imageUrl && { imageUrl }),
            date:now,
            createdAt: now,
            updatedAt: now
        }

        const id = (await adminDb.collection("testimonials").add(docData)).id
        return NextResponse.json(
            { success: true, data: { id, ...docData } },
            { status: 201 }
        );
    }
    catch (error: any) {
        return NextResponse.json(
            {
                error: error.message || "Internal Server Error",
            },
            { status: 500 }
        );
    }
}