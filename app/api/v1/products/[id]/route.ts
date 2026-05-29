// app/api/v1/products/[id]/route.ts

import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>; // ← Next.js 15
}

// ─── GET — fetch single product ───────────────────────────────────────────────
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ← await

    const doc = await adminDb.collection("products").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: { id: doc.id, ...doc.data() } },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// ─── PUT — update a product ───────────────────────────────────────────────────
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ← await

    const docRef = adminDb.collection("products").doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      product_name,
      product_category,
      description,
      product_image,
      gallery_images,
      is_active,
    } = body;

    if (product_name !== undefined && (typeof product_name !== "string" || !product_name.trim())) {
      return NextResponse.json(
        { success: false, error: "product_name cannot be empty" },
        { status: 400 }
      );
    }

    if (product_category !== undefined && (typeof product_category !== "string" || !product_category.trim())) {
      return NextResponse.json(
        { success: false, error: "product_category cannot be empty" },
        { status: 400 }
      );
    }

    if (description !== undefined && description.length > 500) {
      return NextResponse.json(
        { success: false, error: "description must be 500 characters or fewer" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (product_name !== undefined)     updates.product_name     = product_name.trim();
    if (product_category !== undefined) updates.product_category = product_category.trim();
    if (description !== undefined)      updates.description      = description.trim();
    if (product_image !== undefined)    updates.product_image    = product_image;
    if (gallery_images !== undefined)   updates.gallery_images   = Array.isArray(gallery_images) ? gallery_images : [];
    if (is_active !== undefined)        updates.is_active        = is_active;

    await docRef.update(updates);

    const updated = await docRef.get();

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        data: { id: updated.id, ...updated.data() },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// ─── DELETE — remove a product ────────────────────────────────────────────────
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ← await

    const docRef = adminDb.collection("products").doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json(
      { success: true, message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    );
  }
}