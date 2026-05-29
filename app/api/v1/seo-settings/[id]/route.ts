import { verifySession } from "@/lib/auth/verify-session";

import { adminDb } from "@/lib/firebase/admin";

import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin session
    const user = await verifySession(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get document ID
    const { id } = await params;

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

    const updatedAt = new Date().toISOString();

    // Update document
    await adminDb
      .collection("seoSettings")
      .doc(id)
      .update({
        metaTitle,

        metaDescription,

        keywords: keywords || [],

        ogImage: ogImage || "",

        updatedAt,
      });

      const updatedSeoData = {
  id,
  metaTitle,
  metaDescription,
  keywords: keywords || [],
  ogImage: ogImage || "",
  updatedAt,
};

    return NextResponse.json(
      {
        success: true,
        data: updatedSeoData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE SEO SETTINGS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update SEO settings",
      },
      { status: 500 }
    );
  }
}