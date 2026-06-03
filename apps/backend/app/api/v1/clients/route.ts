import { verifySession } from "@/lib/auth/verify-session";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import { ClientSchema } from "@kr/shared/validators/clients.schema";
export const dynamic = "force-dynamic"

const COLLECTION = "clients";

// GET /api/v1/clients?type=client|collaborator&active=true|false&q=search
export async function GET(request: NextRequest) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.nextUrl);
    const type = searchParams.get("type");
    const active = searchParams.get("active");
    const q = (searchParams.get("q") ?? "").trim().toLowerCase();

    // Push the `type` filter to Firestore (single-field, auto-indexed) so we
    // don't pull the whole collection just to drop most of it. `active` and the
    // free-text `q` stay in-memory (active is low-cardinality; q needs substring
    // matching Firestore can't do), as does the `order`/name sort.
    const base = adminDb.collection(COLLECTION);
    const query = type ? base.where("type", "==", type) : base;
    const snap = await query.get();

    let clients = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    if (active === "true") clients = clients.filter((c: any) => c.active === true);
    if (active === "false") clients = clients.filter((c: any) => c.active === false);
    if (q) clients = clients.filter((c: any) => (c.name ?? "").toLowerCase().includes(q));

    clients.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0) || String(a.name).localeCompare(String(b.name)));

    return NextResponse.json({ success: true, message: clients }, { status: 200 });
  } catch (error: any) {
    console.error("GET CLIENTS ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch clients" }, { status: 500 });
  }
}

// POST /api/v1/clients
export async function POST(request: NextRequest) {
  try {
    const user = await verifySession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const docRef = adminDb.collection(COLLECTION).doc();
    const data = {
      ...parsed.data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: user.uid,
    };
    await docRef.set(data);

    return NextResponse.json(
      { success: true, message: "Client created", data: { id: docRef.id, ...parsed.data } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE CLIENT ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to create client" }, { status: 500 });
  }
}
