// app/api/v1/testimonials/[id]/route.ts

import { verifySession } from "@/lib/auth/verify-session";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

// ─── PUT /api/v1/testimonials/[id] ───────────────────────────────────────────

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =  await params;

    // Check document exists
    const docRef = adminDb.collection("testimonials").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, designation, company, message, image, rating, isActive } = body;

    // Basic validation
    if (!name || !message) {
      return NextResponse.json(
        { success: false, error: "Name and message are required" },
        { status: 400 }
      );
    }

    const updatedData = {
      name,
      designation: designation || "",
      company: company || "",
      message,
      image: image || "",
      rating: rating ?? 5,
      isActive: isActive ?? true,
      updatedAt: new Date().toISOString(),
    };

    await docRef.update(updatedData);

    return NextResponse.json(
      {
        success: true,
        message: "Testimonial updated successfully",
        data: { id, ...updatedData },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE TESTIMONIAL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update testimonial" },
      { status: 500 }
    );
  }
}

// app/api/v1/testimonials/[id]/route.ts
// Add this to the same file as your PUT handler

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =  await params;

    // Check document exists
    const docRef = adminDb.collection("testimonials").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Testimonial not found" },
        { status: 404 }
      );
    }

    // If testimonial has an image, delete it from storage too
    const data = doc.data();
    if (data?.image) {
      try {
        const bucket = adminStorage.bucket();
        // Extract file path from public URL
        // URL format: https://storage.googleapis.com/BUCKET_NAME/testimonials/filename
        const urlParts = data.image.split(`${bucket.name}/`);
        if (urlParts[1]) {
          await bucket.file(urlParts[1]).delete();
        }
      } catch (storageError) {
        // Don't block deletion if image cleanup fails
        console.warn("Image cleanup failed:", storageError);
      }
    }

    await docRef.delete();

    return NextResponse.json(
      {
        success: true,
        message: "Testimonial deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE TESTIMONIAL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}