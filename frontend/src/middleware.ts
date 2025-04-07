// import { cookies } from "next/headers";
// import { NextRequest, NextResponse } from "next/server";

// export async function middleware(request: NextRequest) {
//   const cookieStore = await cookies();
//   const token =
//     cookieStore.get("token")?.value || request.headers.get("authorization");

//   if (
//     (request.nextUrl.pathname === "/login" )
//       // ||
//       // request.nextUrl.pathname === "/auth/login") 
//      && token
//   ) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   const protectedRoutes = ["/dashboard", "/employee", "/userpanel"]; // Add other private routes here
//   const isProtected = protectedRoutes.some((route) =>
//     request.nextUrl.pathname.startsWith(route)
//   );

//   if (isProtected && !token) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/dashboard", "/employee", "/userpanel", "/login"],
// };



import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === "/auth/login" || path === "/auth/signup" || path === "/";

  // debugger
  const token = (await cookies()).get("token")?.value;
  // console.log(token,"token visible")
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL("/auth/dashboard", request.url));
  }
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}


// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/auth", "/auth/login", "/auth/signup", "/auth/dashboard", "/employee","/userpanel", ],
};