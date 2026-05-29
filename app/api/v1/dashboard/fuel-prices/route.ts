import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

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
        const { autoLPG, diesel, petrol } = body;

        await adminDb.collection('fuelsPrices').doc('5yPqPwV3Qc1H7NPajXoS').update({
            autoLPG,
            diesel,
            petrol,
            priceUpdatedAt: FieldValue.serverTimestamp(),
        });
        
        return NextResponse.json({ message: "Fuel prices updated successfully" }, { status: 200 })
    }
    catch(error: any) {
        return NextResponse.json({ error: error.message}, { status: 500 });
    }
}