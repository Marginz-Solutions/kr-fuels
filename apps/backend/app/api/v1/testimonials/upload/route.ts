import { verifySession } from "@/lib/auth/verify-session";
import { adminStorage } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const user = await verifySession(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Read form data
    const formData = await request.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file uploaded",
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const fileName = `testimonials/${Date.now()}-${file.name}`;

    // Get bucket
    const bucket = adminStorage.bucket();

    // Create file reference
    const bucketFile = bucket.file(fileName);

    // Upload file
    await bucketFile.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make public
    try { await bucketFile.makePublic(); } catch (e: any) { if (!/uniform bucket-level access/i.test(e?.message ?? "")) console.error("makePublic failed (non-fatal):", e?.message); }

    // Public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        url: publicUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPLOAD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload image",
      },
      { status: 500 }
    );
  }
}