import { verifySession } from "@/lib/auth/verify-session";
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
        return NextResponse.json({
        }, { status: 200 })
    }
    catch(error: any) {
        return NextResponse.json({ error: error.message}, { status: 500 });
    }
}

/**
 * @method POST /api/v1/dashboard/fuel-prices
 * @returns 
 */
export async function POST(req: NextRequest, res: NextResponse) {
    const user = await verifySession(req);

    if(!user) {
        return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
    }

    try {
        return NextResponse.json({
        }, { status: 200 })
    }
    catch(error: any) {
        return NextResponse.json({ error: error.message}, { status: 500 });
    }
}