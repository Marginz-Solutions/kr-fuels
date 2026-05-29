import { adminDb, adminStorage } from "@/lib/firebase/admin"
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server"
export interface Params {
  params: Promise<{ id: string}>;
}
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        // ✅ Read query params from the URL
        const { searchParams } = new URL(req.url)
        const url       = searchParams.get("url")

        if (!id || !url) {
            return NextResponse.json({ error: "id and url are required" }, { status: 400 })
        }

        const bucket      = adminStorage.bucket()
        const storagePath = extractStoragePath(url, bucket.name) 
        await bucket.file(storagePath).delete()
        await adminDb.collection("stationImages").doc(id).delete()

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("DELETE /images error:", error)
        return NextResponse.json(
            { error: error?.message ?? "Failed to delete image" },
            { status: 500 }
        )
    }
}

function extractStoragePath(url: string, bucket: string): string {
    // Firebase download URL: .../o/ENCODED_PATH?token=...
    if (url.includes("/o/")) {
        return decodeURIComponent(url.split("/o/")[1].split("?")[0])
    }

    // Direct GCS URL: storage.googleapis.com/BUCKET/PATH
    const prefix = `https://storage.googleapis.com/${bucket}/`
    if (url.startsWith(prefix)) {
        return decodeURIComponent(url.replace(prefix, ""))
    }

    throw new Error(`Unrecognised storage URL format: ${url}`)
}