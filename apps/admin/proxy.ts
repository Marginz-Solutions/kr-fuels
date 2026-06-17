import { NextResponse, NextRequest } from "next/server";

// Routes reachable without a session. Note: matching must be exact / prefixed
// — a bare "/" with startsWith() would mark EVERY path public.
const PUBLIC_PREFIXES = ["/login", "/register", "/forgot-password", "/api", "/_next", "/assets"];

function isPublicPath(pathname: string): boolean {
    if (pathname === "/") return true; // root self-redirects in app/page.tsx
    return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(req: NextRequest) {
    const { pathname, search } = req.nextUrl;
    const session = req.cookies.get("session")?.value;

    if (!isPublicPath(pathname) && !session) {
        // Send unauthenticated users to login, remembering where they were headed.
        const url = new URL("/login", req.url);
        url.searchParams.set("next", `${pathname}${search}`);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
