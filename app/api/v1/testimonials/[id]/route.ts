import { verifySession } from "@/lib/auth/verify-session";
import { NextRequest, NextResponse } from "next/server";
import { Params } from "../../stations/[id]/route";
import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { TestimonialPatchSchema } from "@/lib/validators/testimonial.schema";
import {Bucket} from "@google-cloud/storage"
import { FieldValue } from "firebase-admin/firestore";



// ── Helpers ─────────────────────────────────────────────────────────────────

async function parseAndValidateFields(formData: FormData) {
  const raw = formData.get("data");
  if (!raw) return { fields: null, error: null };

  if (typeof raw !== "string") {
    return { fields: null, error: "Invalid data field" };
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return { fields: null, error: "Invalid JSON in data field" };
  }

  const result = TestimonialPatchSchema.safeParse(body);
  if (!result.success) {
    return { fields: null, error: result.error.flatten().fieldErrors };
  }

  return { fields: result.data, error: null };
}

async function deleteOldImage(bucket: Bucket, imageUrl: string) {
  try {
    const oldPath = imageUrl.split(`${bucket.name}/`)[1]?.split("?")[0];
    if (oldPath) await bucket.file(decodeURIComponent(oldPath)).delete();
  } catch {
    console.warn("Could not delete old testimonial image");
  }
}

async function uploadTestimonialImage(imageFile: File, uid: string) {
  const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);
  const buffer = Buffer.from(await imageFile.arrayBuffer());
  const ext = imageFile.name.split(".").pop();
  const fileName = `testimonials/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const fileRef = bucket.file(fileName);

  await fileRef.save(buffer, {
    metadata: { contentType: imageFile.type, metadata: { uploadedBy: uid } },
  });

  await fileRef.makePublic();
  return { bucket, imageUrl: `https://storage.googleapis.com/${bucket.name}/${fileName}` };
}

// ── PATCH handler ────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const user = await verifySession(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ref = adminDb.collection("testimonials").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const hasImage = !!imageFile && imageFile.size > 0;
    const hasData = !!formData.get("data");

    if (!hasData && !hasImage) {
      return NextResponse.json({ error: "No fields or image provided" }, { status: 400 });
    }

    const { fields, error } = await parseAndValidateFields(formData);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    let imageUrl: string | undefined;
    if (hasImage) {
      const existingImageUrl = doc.data()?.imageUrl as string | undefined;
      const { bucket, imageUrl: newUrl } = await uploadTestimonialImage(imageFile, user.uid);
      if (existingImageUrl) await deleteOldImage(bucket, existingImageUrl);
      imageUrl = newUrl;
    }

    const updatedData = {
      ...fields,
      ...(imageUrl && { imageUrl }),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await ref.update(updatedData);
    return NextResponse.json({ success: true, data: { id, ...updatedData } });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const { id } = await params;

    const user = await verifySession(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ref = adminDb.collection("testimonials").doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
        return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    const imageUrl: string = doc.data()?.imageUrl;

    if (imageUrl) {
        const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET);

        try {

            const filePath = decodeURIComponent(
                imageUrl.split(`${bucket.name}/`)[1]
            );

            await bucket.file(filePath).delete();
        } catch (err: any) {
            console.error("❌ Error:", err.code, err.message);
        }

    }

    await ref.delete();

    return NextResponse.json({
        success: true,
        message: "Testimonial deleted",
    });
}