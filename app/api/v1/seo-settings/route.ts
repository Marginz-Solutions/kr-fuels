import { verifySession } from "@/lib/auth/verify-session";

import { adminDb } from "@/lib/firebase/admin";

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

    // Fetch SEO settings
    const snapshot = await adminDb
      .collection("seoSettings")
      .limit(1)
      .get();

    // No document found
    if (snapshot.empty) {
      return NextResponse.json(
        {
          success: true,
          message: null,
        },
        { status: 200 }
      );
    }

    // Get first document
    const doc = snapshot.docs[0];

    const seoSettings = {
      id: doc.id,
      ...doc.data(),
    };

    return NextResponse.json(
      {
        success: true,
        message: seoSettings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET SEO SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch SEO settings",
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
      metaTitle,
      metaDescription,
      keywords,
      ogImage,
    } = body;

    // Validation
    if (!metaTitle || !metaDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Meta title and meta description are required",
        },
        { status: 400 }
      );
    }

    // Check existing SEO settings
    const existingSnapshot = await adminDb
      .collection("seoSettings")
      .limit(1)
      .get();

    // Prevent multiple documents
    if (!existingSnapshot.empty) {
      return NextResponse.json(
        {
          success: false,
          error: "SEO settings already exist",
        },
        { status: 400 }
      );
    }

    // Create document
    const docRef = adminDb.collection("seoSettings").doc();

    const seoData = {
      id: docRef.id,

      metaTitle,

      metaDescription,

      keywords: keywords || [],

      ogImage: ogImage || "",

      createdAt: new Date().toISOString(),

      updatedAt: new Date().toISOString(),
    };

    // Save to Firestore
    await docRef.set(seoData);

    return NextResponse.json(
      {
        success: true,
        message: "SEO settings created successfully",
        data: seoData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE SEO SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create SEO settings",
      },
      { status: 500 }
    );
  }
}