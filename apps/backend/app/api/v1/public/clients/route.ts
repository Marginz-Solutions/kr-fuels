import { adminDb } from "@/lib/firebase/admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// PUBLIC, read-only. GET /api/v1/public/clients?type=collaborator
// Returns ACTIVE clients/collaborators for the website (partner logos etc.).
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.nextUrl);
    const type = searchParams.get("type");

    const snap = await adminDb.collection("clients").where("active", "==", true).get();

    let clients = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        type: data.type ?? "collaborator",
        website: data.website ?? "",
        logo: data.logo ?? "",
        order: data.order ?? 0,
      };
    });

    if (type) clients = clients.filter((c) => c.type === type);
    clients.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));

    return NextResponse.json({ success: true, data: clients }, { status: 200 });
  } catch (error: any) {
    // Degrade gracefully (200 + empty) like every other public endpoint, so the
    // website just hides the partners section instead of erroring.
    console.error("PUBLIC CLIENTS ERROR:", error?.message ?? error);
    return NextResponse.json({ success: false, error: "Failed to fetch clients", data: [] });
  }
}
