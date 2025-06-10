import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/home", "/profile", "/saved", "/explore"];
const authRoutes = ["/", "/auth/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  // console.log(token);

  // // First, handle cases where user is authenticated
  // if (authRoutes.some((route) => pathname === route) && token) {
  //   return NextResponse.redirect(new URL("/home", request.url));
  // }

  // // Then handle protected routes
  // const isProtected = protectedRoutes.some((route) =>
  //   pathname.startsWith(route)
  // );
  // if (isProtected && !token) {
  //   const loginUrl = new URL("/auth/login", request.url);
  //   loginUrl.searchParams.set("redirect", pathname); // Preserve original destination
  //   return NextResponse.redirect(loginUrl);
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/auth/login",
    "/home/:path*",
    "/profile/:path*",
    "/saved",
    "/explore",
  ],
};
