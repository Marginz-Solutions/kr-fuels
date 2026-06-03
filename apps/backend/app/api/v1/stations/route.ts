import { adminDb, adminStorage } from "@/lib/firebase/admin";
import { verifySession } from "@/lib/auth/verify-session";
import { NextRequest, NextResponse } from "next/server";
import { type Query, type DocumentData, FieldValue } from "firebase-admin/firestore";
import { StationSchema } from "@kr/shared/validators/station.schema";
import { DecodedIdToken } from "firebase-admin/auth";
import AppError from "@/utils/appError";
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const page = Math.max(Number.parseInt(searchParams.get("page") ?? "1"), 1);
    const limit = Math.min(Number.parseInt(searchParams.get("limit") ?? "10"), 100);
    const skip = (page - 1) * limit;
    const district = searchParams.get("district") ?? "";
    const area = searchParams.get("area") ?? "";
    const search = searchParams.get("search") ?? "";

    let query: Query<DocumentData> = adminDb.collection("stations");

    if (district) query = query.where("district", "==", district);
    if (area) query = query.where("area", "==", area);
    if (search) {
      query = query
        .where("stationName", ">=", search)
        .where("stationName", "<=", search + "\uf8ff");
    }

    const baseCollection = adminDb.collection("stations");

    const [
      countSnap,
      activeSnap,
      inactiveSnap,
      districtsSnap,
      paginatedSnap,
    ] = await Promise.all([

      query.count().get(),

      baseCollection.where("status", "==", "active").count().get(),

      baseCollection.where("status", "==", "inactive").count().get(),

      baseCollection.select("district").get(),

      query.orderBy("stationName").offset(skip).limit(limit).get(),
    ]);


    const uniqueDistricts = [
      ...new Set(districtsSnap.docs.map(doc => doc.data().district).filter(Boolean))
    ].sort();


    const total = countSnap.data().count;
    const totalPages = Math.ceil(total / limit);

    const stations = paginatedSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(stations)

    return NextResponse.json({
      data: stations,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats: {
        active: activeSnap.data().count,
        inactive: inactiveSnap.data().count,
        totalDistricts: uniqueDistricts.length,
        districts: uniqueDistricts,
      },
    });
  }
  catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const raw = formData.get("data");
    if (!raw || typeof raw !== "string") {
      return NextResponse.json({ error: "Missing station data" }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Invalid JSON in data field" }, { status: 400 });
    }



    const result = StationSchema.safeParse({ ...body, status: "active" });
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }



    const imageUrls = await pushImagesToStorage(formData, user);

    const docData = {
      ...result.data,
      images: imageUrls,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: user.uid,
    };

    const id = (await adminDb.collection("stations").add(docData)).id;

    if (imageUrls.length > 0) {
      const batch = adminDb.batch()

      imageUrls.forEach((url: string) => {
        const imageRef = adminDb.collection("stationImages").doc()
        batch.set(imageRef, {
          url,
          stationId: id,
          createdAt: FieldValue.serverTimestamp(),
          createdBy: user.uid,
        })
      })

      await batch.commit()
    }

    return NextResponse.json(
      { success: true, data: { id, ...docData } },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}


export const pushImagesToStorage = async (
  formData: FormData,
  user: DecodedIdToken | null
): Promise<string[]> => {
  const imageFiles = formData.getAll("images") as File[]
  const bucket = adminStorage.bucket(process.env.FIREBASE_STORAGE_BUCKET)

  // Validate up front so a bad file fails fast before any upload starts.
  for (const file of imageFiles) {
    if (!file.type.startsWith("image/")) {
      throw new AppError("Invalid file format", 400)
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new AppError(`File too large: ${file.name} (max 5MB)`, 400);
    }
  }

  // Upload concurrently — sequential awaits made multi-image uploads N× slower.
  // Promise.all preserves input order, so imageUrls matches the file order.
  const imageUrls = await Promise.all(
    imageFiles.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop()
      const fileName = `stations/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const fileRef = bucket.file(fileName)

      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
          metadata: { uploadedBy: user?.uid }
        }
      })

      // Buckets with Uniform Bucket-Level Access (UBLA) reject per-object ACLs, so
      // makePublic() throws "Cannot update access control … when uniform bucket-level
      // access is enabled". Treat it as non-fatal — the object is served publicly via
      // bucket IAM instead (see HANDOFF.md: make the bucket/prefix public once).
      try {
        await fileRef.makePublic()
      } catch (e: any) {
        if (!/uniform bucket-level access/i.test(e?.message ?? "")) {
          console.error("makePublic failed (non-fatal):", e?.message)
        }
      }

      return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    })
  );

  return imageUrls;
}


