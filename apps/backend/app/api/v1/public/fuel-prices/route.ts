import { adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PUBLIC. Today's fuel prices for the website banner + calculators.
export async function GET() {
  try {
    const snap = await adminDb.collection("fuelsPrices").doc("5yPqPwV3Qc1H7NPajXoS").get();
    const data = snap.data() ?? {};
    return NextResponse.json({
      success: true,
      data: {
        autoLPG: data.autoLPG ?? 0,
        petrol: data.petrol ?? 0,
        diesel: data.diesel ?? 0,
        verified: data.verifiedBy ?? null,
        priceUpdatedAt: data.priceUpdatedAt?.toDate?.()?.toISOString() ?? null,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, data: { autoLPG: 0, petrol: 0, diesel: 0, verified: null, priceUpdatedAt: null }, error: e.message },
    );
  }
}
