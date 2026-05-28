// app/api/v1/products/[id]/toggle/route.ts

import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>; // ← Next.js 15: params is now a Promise
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params; // ← await it

    const docRef = adminDb.collection("products").doc(id);
    const existing = await docRef.get();

    if (!existing.exists) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const currentData = existing.data()!;
    const newActiveState = !currentData.is_active;

    await docRef.update({
      is_active: newActiveState,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `Product ${newActiveState ? "activated" : "deactivated"} successfully`,
        data: {
          id,
          is_active: newActiveState,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("TOGGLE PRODUCT ERROR:", error); // ← check your terminal for the real error
    return NextResponse.json(
      { success: false, error: "Failed to toggle product" },
      { status: 500 }
    );
  }
}