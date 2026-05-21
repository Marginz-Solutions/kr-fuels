import { NextResponse,NextRequest } from "next/server";

const PUBLIC_PATHS = ["/","/login","/register","/api/auth"]

export async function proxy(req:NextRequest){
    const {pathname} = req.nextUrl;
    const isPublic= PUBLIC_PATHS.some(p=>pathname.startsWith(p))

    const session = req.cookies.get("session")?.value

    if(!isPublic && !session){
         return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next()
}

export const config = {
    matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]
}