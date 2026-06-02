import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"

// ─── GET — fetch all categories ───────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection("product_categories")
      .orderBy("created_at", "asc")
      .get();

    const categories = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { success: true, data: categories },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// ─── POST — create a category ─────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon_label } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "name is required" },
        { status: 400 }
      );
    }

    // ── Check for duplicate ───────────────────────────────────────────────────
    const existing = await adminDb
      .collection("product_categories")
      .where("name", "==", name.trim())
      .get();

    if (!existing.empty) {
      return NextResponse.json(
        { success: false, error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    const docRef = adminDb.collection("product_categories").doc();
    const now = new Date().toISOString();

    const categoryData = {
      id: docRef.id,
      name: name.trim(),
      icon_label: icon_label || "Package", // matches ICON_OPTIONS label
      created_at: now,
      updated_at: now,
    };

    await docRef.set(categoryData);

    return NextResponse.json(
      { success: true, data: categoryData },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}