import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const user = await verifySession(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch active testimonials
    const snapshot = await adminDb
      .collection("testimonials")
      .orderBy("createdAt", "desc")
      .get();

    // Convert firestore docs to array
    const testimonials = snapshot.docs.map((doc) => {
  const data = doc.data();

  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
  };
});

    return NextResponse.json(
      {
        success: true,
        message: testimonials,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET TESTIMONIAL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch testimonials",
      },
      { status: 500 }
    );
  }
}

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

    // Parse request body
    const body = await request.json();

    const {
      name,
      designation,
      company,
      message,
      image,
      rating,
      isActive,
    } = body;

    // Basic validation
    if (!name || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and message are required",
        },
        { status: 400 }
      );
    }

    // Create document
    const docRef = adminDb.collection("testimonials").doc();

    const testimonialData = {
      id: docRef.id,
      name,
      designation: designation || "",
      company: company || "",
      message,
      image: image || "",
      rating: rating || 5,
      isActive: isActive ?? true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Save to Firestore
    await docRef.set(testimonialData);

    return NextResponse.json(
      {
        success: true,
        message: "Testimonial created successfully",
        data: testimonialData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE TESTIMONIAL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create testimonial",
      },
      { status: 500 }
    );
  }
}