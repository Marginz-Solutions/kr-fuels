import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, slug, status, banner, sections } = body;

    if (!title || !sections || !banner) {
      return NextResponse.json(
        { success: false, error: "title, banner, and sections are required" },
        { status: 400 }
      );
    }

    const updatedAt = FieldValue.serverTimestamp();

    const updateData = {
      title,
      slug: slug || "privacy-policy",
      status: status || "published",
      banner: {
        title: banner.title || "",
        subtitle: banner.subtitle || "",
      },
      sections: sections || [],
      updatedAt,
      updatedBy: user.email || "admin",
    };

    await adminDb
      .collection("privacyPolicy")
      .doc(id)
      .update(updateData);

    const updatedDoc = {
      id,
      ...updateData,
    };

    return NextResponse.json(
      { success: true, message: "Privacy policy updated successfully", data: updatedDoc },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE PRIVACY POLICY ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update privacy policy" },
      { status: 500 }
    );
  }
}