import { verifySession } from "@/lib/auth/verify-session";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { StationPatchSchema, StationSchema } from "@/lib/validators/station.schema";
import { NextRequest, NextResponse } from "next/server";

export interface Params {
  params: Promise<{ id: string }>;
}


export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params; // ✅ await first

  const user = await verifySession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await adminDb.collection("stations").doc(id).get();

  if (!doc.exists) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: { id: doc.id, ...doc.data() } });
}


export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params; // ✅ await first

  const user = await verifySession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ref = adminDb.collection("stations").doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }

  const body = await request.json();
  const result = StationPatchSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updatedData = {
    ...result.data,
  };

  await ref.update(updatedData);

  return NextResponse.json({ success: true, data: { id, ...updatedData } });
}


export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;

  const user = await verifySession(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ref = adminDb.collection("stations").doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Station not found" }, { status: 404 });
  }


  const images: string[] = doc.data()?.images ?? [];

  if (images.length > 0) {
    const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

    await Promise.all(
      images.map(async (url) => {
        try {
          // Extract: "stations/filename.jpg" from full URL
          const filePath = decodeURIComponent(
            url.split(`${bucket.name}/`)[1]
          );

          console.log("url       →", url);
          console.log("bucket    →", bucket.name);
          console.log("filePath  →", filePath);

          await bucket.file(filePath).delete();
          console.log("✅ Deleted:", filePath);
        } catch (err: any) {
          console.error("❌ Error:", err.code, err.message);
        }
      })
    );
  }

  await ref.delete();

  return NextResponse.json({
    success: true,
    message: "Station deleted",
    deletedImages: images.length,
  });
}

