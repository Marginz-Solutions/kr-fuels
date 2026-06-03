import { NextRequest, NextResponse } from "next/server";

// Server-to-server — no CORS restrictions. Uses the ABSOLUTE backend base
// (NEXT_PUBLIC_API_BASE_URL is now a relative same-origin path for the browser,
// which a server-side fetch can't resolve).
const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:4000/api/v1";
const BACKEND_SESSION = `${BACKEND_API_BASE_URL}/auth/session`;

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 14, // 14 days
};

// Proxy session creation to the backend so the cookie is set on the admin's
// own domain (not the backend's), allowing the middleware to read it.
export async function POST(req: NextRequest) {
  let idToken: string | undefined;
  try {
    ({ idToken } = await req.json());
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (!idToken) {
    return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
  }

  try {
    const backendRes = await fetch(BACKEND_SESSION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!backendRes.ok) {
      const { error } = await backendRes.json().catch(() => ({ error: "Unauthorized" }));
      return NextResponse.json({ error }, { status: backendRes.status });
    }

    // Extract the session value from the backend's Set-Cookie header.
    const setCookie = backendRes.headers.get("set-cookie");
    const sessionMatch = setCookie?.match(/^session=([^;]+)/);
    if (!sessionMatch) {
      return NextResponse.json({ error: "No session returned" }, { status: 500 });
    }

    const response = NextResponse.json({ status: "success" });
    response.cookies.set("session", sessionMatch[1], cookieConfig);
    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: "success" });
  response.cookies.set("session", "", { ...cookieConfig, maxAge: 0 });
  return response;
}
