import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection("privacyPolicy")
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, message: null }, { status: 200 });
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Convert Firestore Timestamps to ISO strings
    const privacyPolicy = {
      id: doc.id,
      ...data,
      publishedAt: data.publishedAt?.toDate?.()?.toISOString() ?? data.publishedAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt,
    };

    return NextResponse.json({ success: true, message: privacyPolicy }, { status: 200 });
  } catch (error) {
    console.error("GET PRIVACY POLICY ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch privacy policy" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Prevent duplicates
    const existing = await adminDb.collection("privacyPolicy").limit(1).get();
    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: "Privacy policy already exists. Use PUT to update." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, slug, status, banner, sections } = body;

    if (!title || !sections || !banner) {
      return NextResponse.json(
        { success: false, error: "title, banner, and sections are required" },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection("privacyPolicy").doc();
    const now = FieldValue.serverTimestamp();

    const privacyPolicyData = {
      id: docRef.id,
      title,
      slug: slug || "privacy-policy",
      status: status || "published",
      banner: {
        title: banner.title || "",
        subtitle: banner.subtitle || "",
      },
      sections: sections || [],
      publishedAt: now,
      updatedAt: now,
      updatedBy: user.email || "admin",
    };

    await docRef.set(privacyPolicyData);

    return NextResponse.json(
      { success: true, message: "Privacy policy created successfully", data: privacyPolicyData },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PRIVACY POLICY ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create privacy policy" },
      { status: 500 }
    );
  }
}