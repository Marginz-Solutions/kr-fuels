import { verifySession } from "@/lib/auth/verify-session";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { StationPatchSchema, StationSchema } from "@/lib/validators/station.schema";
import { NextRequest, NextResponse } from "next/server";
import { pushImagesToStorage } from "../route";
import { FieldValue } from "firebase-admin/firestore";
import { flattenObject } from "../../admin-contact/essentials/route";

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


  const formData = await request.formData();

  const fields: Record<string, any> = {};
  const imageFormData = new FormData();
  let hasImages = false;

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      imageFormData.append(key, value);
      hasImages = true;
    } else {
      try {
        fields[key] = JSON.parse(value)
      } catch {
        fields[key] = value
      }
    }
  }

  const payload = fields.data ?? fields

  const result = StationPatchSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const updatedData: Record<string, any> = flattenObject(result.data)

  if (hasImages) {
    const imageUrls = await pushImagesToStorage(imageFormData, user);
    updatedData.images = FieldValue.arrayUnion(...imageUrls);
  }

  if (Object.keys(updatedData).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }
  await ref.update(updatedData)
  const snapshot = await ref.get()
  const updated = { id: snapshot.id, ...snapshot.data() }

  return NextResponse.json({ success: true, data: { ...updated } });
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

