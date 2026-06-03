import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"

// ─── GET — fetch all products ─────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection("products")
      .orderBy("created_at", "desc")
      .get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { success: true, message: products },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ─── POST — create a product ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      product_name, product_category, tagline, description,
      product_image, gallery_images, sections, specs, slug,
      cta_primary_text, cta_primary_href, cta_secondary_text, cta_secondary_href,
      is_active, is_external, external_url,
    } = body;

    if (!product_name || typeof product_name !== "string" || !product_name.trim())
      return NextResponse.json({ success: false, error: "product_name is required" }, { status: 400 });
    if (!product_category || typeof product_category !== "string" || !product_category.trim())
      return NextResponse.json({ success: false, error: "product_category is required" }, { status: 400 });

    const docRef = adminDb.collection("products").doc();
    const now = new Date().toISOString();

    const productData = {
      id: docRef.id,
      product_name: product_name.trim(),
      product_category: product_category.trim(),
      tagline: tagline?.trim() || "",
      description: description?.trim() || "",
      product_image: product_image || "",
      gallery_images: Array.isArray(gallery_images) ? gallery_images : [],
      sections: Array.isArray(sections) ? sections : [],
      specs: Array.isArray(specs) ? specs : [],
      slug: slug?.trim() || "",
      cta_primary_text: cta_primary_text?.trim() || "Find a station",
      cta_primary_href: cta_primary_href?.trim() || "/stations",
      cta_secondary_text: cta_secondary_text?.trim() || "Talk to our team",
      cta_secondary_href: cta_secondary_href?.trim() || "/contact",
      is_active: is_active ?? true,
      is_external: is_external ?? false,
      external_url: external_url || "",
      created_at: now,
      updated_at: now,
    };

    await docRef.set(productData);

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: productData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    );
  }
}