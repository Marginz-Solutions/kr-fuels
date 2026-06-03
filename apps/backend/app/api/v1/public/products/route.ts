import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PUBLIC. Active products (+ categories) with their external_url links.
export async function GET() {
  try {
    const [productsSnap, categoriesSnap] = await Promise.all([
      adminDb.collection("products").where("is_active", "==", true).get(),
      adminDb.collection("product_categories").get(),
    ]);

    const products = productsSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        product_name: d.product_name ?? "",
        product_category: d.product_category ?? "",
        description: d.description ?? "",
        tagline: d.tagline ?? "",
        product_image: d.product_image ?? "",
        gallery_images: d.gallery_images ?? [],
        sections: d.sections ?? [],
        specs: d.specs ?? [],
        slug: d.slug ?? "",
        cta_primary_text: d.cta_primary_text ?? "",
        cta_primary_href: d.cta_primary_href ?? "",
        cta_secondary_text: d.cta_secondary_text ?? "",
        cta_secondary_href: d.cta_secondary_href ?? "",
        is_external: d.is_external ?? false,
        external_url: d.external_url ?? "",
      };
    });

    const categories = categoriesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, data: products, categories });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: [], categories: [], error: e.message });
  }
}
