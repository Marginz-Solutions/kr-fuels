import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { ExcelUploadStationSchema } from "@/lib/validators/station.schema";
import { Station, StationRow } from "@/types/dust";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx"
export async function POST(req: NextRequest) {
    const user = await verifySession(req)
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
    ]

    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
            { error: "Invalid file type. Only .xlsx and .xls are allowed" },
            { status: 400 }
        );
    }

    if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
            { error: "File too large. Max size is 5MB" },
            { status: 400 }
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" })

    const result = ExcelUploadStationSchema.safeParse(rawRows)

    if (!result.success) {
        return NextResponse.json(
            {
                error: "Validation failed",
                issues: result.error.flatten().fieldErrors,
            },
            { status: 400 }
        );
    }

    const batch = adminDb.batch();

    const savedIds: string[] = []

    for (const row of result.data as StationRow[]) {
        const ref = adminDb.collection("stations").doc()
        const payload: Station = {
            district: row.district,
            area: row.area,
            stationName: row.stationName,
            contactPerson: row.contactPerson,
            mobileNumber: row.mobileNumber,
            ...(row.telephone && { telephone: row.telephone }),
            ...(row.emailID && { emailID: row.emailID }),
            address: {
                ...(row.doorNo && { doorNo: row.doorNo }),
                ...(row.street && { street: row.street }),
                pincode: row.pincode
            },
            location: {
                latitude: row.latitude,
                longitude: row.longitude
            }
        }
        batch.set(ref, payload)
        savedIds.push(ref.id)
    }

    await batch.commit()

    return NextResponse.json(
        {
            success: true,
            data: {
                inserted: savedIds.length,
                ids: savedIds,
            },
        },
        { status: 201 }
    );

}