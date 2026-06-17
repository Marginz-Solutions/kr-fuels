import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic"

/**
 * @method GET /api/v1/dashboard/fuel-prices
 * @returns 
 */
export async function GET(req: NextRequest) {
    const user = await verifySession(req);

    if(!user) {
        return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
    }

    try {
        const response = await adminDb.collection('fuelsPrices').doc('5yPqPwV3Qc1H7NPajXoS').get();

        if(!response.exists) {
            return NextResponse.json({ error: "Fuel prices not found" }, { status: 404 });
        }

        const data = response.data();

        if(!data) {
            return NextResponse.json({ error: "Fuel prices data not found" }, { status: 404 });
        }

        return NextResponse.json({
            data: {
                autoLPG: data.autoLPG,
                petrol: data.petrol,
                diesel: data.diesel,
                verified: data.verifiedBy,
            }
        }, { status: 200 })
    }
    catch(error: any) {
        return NextResponse.json({ error: error.message}, { status: 500 });
    }
}

/**
 * @method PUT /api/v1/dashboard/fuel-prices
 * @returns 
 */
export async function PUT(req: NextRequest) {
    const user = await verifySession(req);

    if(!user) {
        return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
    }

    try {
        const body = await req.json();

        // Coerce + validate: each price must be a finite, non-negative number.
        // Reject anything else so we never persist NaN/undefined/garbage.
        const toPrice = (v: unknown): number | null => {
            const n = typeof v === "string" ? Number(v.trim()) : Number(v);
            return Number.isFinite(n) && n >= 0 ? n : null;
        };
        const autoLPG = toPrice(body.autoLPG);
        const diesel = toPrice(body.diesel);
        const petrol = toPrice(body.petrol);

        if (autoLPG === null || diesel === null || petrol === null) {
            return NextResponse.json(
                { error: "Invalid prices: autoLPG, diesel and petrol must be non-negative numbers." },
                { status: 400 }
            );
        }

        await adminDb.collection('fuelsPrices').doc('5yPqPwV3Qc1H7NPajXoS').update({
            autoLPG,
            diesel,
            petrol,
            priceUpdatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json(
            { message: "Fuel prices updated successfully", data: { autoLPG, diesel, petrol } },
            { status: 200 }
        )
    }
    catch(error: any) {
        return NextResponse.json({ error: error.message}, { status: 500 });
    }
}