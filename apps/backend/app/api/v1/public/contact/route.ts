import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PUBLIC. Company contact details (header/footer/contact page + map).
export async function GET() {
  try {
    const [essentialsSnap, presentsSnap] = await Promise.all([
      adminDb.collection("adminContactDetails").doc("essentials").get(),
      adminDb.collection("adminContactDetails").doc("presents").get(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        essentials: essentialsSnap.exists ? { id: essentialsSnap.id, ...essentialsSnap.data() } : null,
        presents: presentsSnap.exists ? { id: presentsSnap.id, ...presentsSnap.data() } : null,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, data: { essentials: null, presents: null }, error: e.message });
  }
}
