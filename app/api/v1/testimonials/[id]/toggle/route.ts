// app/api/v1/testimonials/[id]/toggle/route.ts
// This is a NEW file — separate from [id]/route.ts

import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
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

    // Read current value and flip it
    const current = doc.data();
    const newIsActive = !current?.isActive;

    await docRef.update({
      isActive: newIsActive,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `Testimonial ${newIsActive ? "published" : "hidden"} successfully`,
        data: {
          id,
          isActive: newIsActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("TOGGLE TESTIMONIAL ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle testimonial status" },
      { status: 500 }
    );
  }
}