import { verifySession } from "@/lib/auth/verify-session";
import { adminStorage } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const user = await verifySession(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type))
    return NextResponse.json({ success: false, error: "Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed" }, { status: 400 });
  if (file.size > MAX_SIZE_BYTES)
    return NextResponse.json({ success: false, error: "File too large. Maximum size is 5MB" }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitized = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const fileName = `hero/${Date.now()}-${sanitized}`;
    const bucket = adminStorage.bucket();
    const bucketFile = bucket.file(fileName);

    await bucketFile.save(buffer, { metadata: { contentType: file.type } });
    try { await bucketFile.makePublic(); } catch (e: any) {
      if (!/uniform bucket-level access/i.test(e?.message ?? "")) console.error("makePublic failed:", e?.message);
    }

    const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    return NextResponse.json({ success: true, url }, { status: 200 });
  } catch (error) {
    console.error("HERO UPLOAD ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 });
  }
}
