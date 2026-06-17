import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { ExcelUploadStationSchema } from "@kr/shared/validators/station.schema";
import { Station, StationRow } from "@kr/shared/types/dust";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import * as XLSX from "xlsx"
export const dynamic = "force-dynamic"

// Identity of a station for dedup purposes: name + canonical mobile number.
// The schema already canonicalises mobileNumber to a bare 10-digit value, so the
// same station always produces the same key regardless of how the sheet formats it.
const stationKey = (stationName: string, mobileNumber: string) =>
    `${(stationName ?? "").trim().toLowerCase().replace(/\s+/g, " ")}|${(mobileNumber ?? "").trim()}`
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

    // ── Idempotency guard ────────────────────────────────────────────────
    // Without this, re-uploading the same sheet — or a double-click that fires the
    // request twice — inserts the whole file again as fresh auto-ID docs, so the
    // station count balloons (e.g. 8 → 80) and the list shows the same stations
    // repeated. Skip any row that already exists (by name + mobile) and any row
    // duplicated inside the sheet itself, so an upload becomes safe to retry.
    const existingSnap = await adminDb
        .collection("stations")
        .select("stationName", "mobileNumber")
        .get()
    const existingKeys = new Set(
        existingSnap.docs.map(d => stationKey(d.data().stationName, d.data().mobileNumber))
    )

    const batch = adminDb.batch();

    const savedIds: string[] = []
    const skipped: string[] = []
    const seen = new Set<string>()  // collapse duplicate rows within the same sheet

    for (const row of result.data as StationRow[]) {
        const key = stationKey(row.stationName, row.mobileNumber)
        if (existingKeys.has(key) || seen.has(key)) {
            skipped.push(row.stationName)
            continue
        }
        seen.add(key)

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
                pincode: row.pincode.toString()
            },
            workingHours:row.workingHours,
            status:"active",
            location: {
                latitude: row.latitude,
                longitude: row.longitude
            }
        }
        batch.set(ref, { ...payload, createdAt: FieldValue.serverTimestamp(), createdBy: user.uid })
        savedIds.push(ref.id)
    }

    if (savedIds.length > 0) await batch.commit()

    return NextResponse.json(
        {
            success: true,
            data: {
                inserted: savedIds.length,
                skipped: skipped.length,
                skippedStations: skipped,
                ids: savedIds,
            },
        },
        { status: 201 }
    );

}