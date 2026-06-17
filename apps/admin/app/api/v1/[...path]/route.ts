import { NextRequest, NextResponse } from "next/server";

// Catch-all reverse proxy for the backend API (replaces the old next.config.ts
// rewrite). In production the admin and backend live on different Firebase App
// Hosting hostnames; the browser stores the httpOnly `session` cookie on the
// admin host, so client code calls the RELATIVE base "/api/v1" (same-origin →
// the cookie attaches) and this handler forwards the request to the real
// backend with that cookie.
//
// WHY a route handler instead of a rewrite: App Hosting routes by Host header.
// Next's external rewrite forwarded the request to the backend carrying the
// ADMIN's Host, so Google's frontend rejected every proxied call with a 401
// "your client does not have permission" HTML page — which surfaced client-side
// as 401s and "Unexpected token '<'" JSON-parse errors. A native fetch() to the
// absolute backend URL sets the correct Host (exactly like lib/server-fetch.ts),
// which is why server-side reads worked while client proxy calls 401'd.
const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:4000/api/v1";

// Methods that may carry a request body to forward verbatim (incl. multipart
// file uploads — we forward raw bytes + the original Content-Type/boundary).
const BODY_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Reading cookies makes this dynamic; be explicit so it's never cached.
export const dynamic = "force-dynamic";

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const target = `${BACKEND_API_BASE_URL}/${path.join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  // Forward the session cookie the browser attached same-origin — this is what
  // authenticates the request at the backend (matches verifySession).
  const session = req.cookies.get("session")?.value;
  if (session) headers.set("cookie", `session=${session}`);

  const init: RequestInit = { method: req.method, headers, redirect: "manual" };
  if (BODY_METHODS.has(req.method)) {
    const body = await req.arrayBuffer();
    if (body.byteLength) init.body = body;
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(target, init);
  } catch {
    return NextResponse.json(
      { error: "Upstream request failed" },
      { status: 502 },
    );
  }

  // Pass the backend response straight through (decoded body + status). We copy
  // only Content-Type so Next recomputes Content-Length and we don't leak a
  // stale content-encoding/length from the upstream.
  const noBody = backendRes.status === 204 || backendRes.status === 304;
  const buf = noBody ? null : await backendRes.arrayBuffer();
  const res = new NextResponse(buf, { status: backendRes.status });
  const resType = backendRes.headers.get("content-type");
  if (resType) res.headers.set("content-type", resType);
  return res;
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as HEAD,
};
