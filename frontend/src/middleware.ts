import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/auth/login" || path === "/auth/signup" || path === "/";

  const token = (await cookies()).get("token")?.value;
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/auth/dashboard", request.url));
  }
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

export const config = {
  matcher: ["/auth", "/auth/login", "/auth/signup", "/auth/dashboard", "/employee","/userpanel", ],
};