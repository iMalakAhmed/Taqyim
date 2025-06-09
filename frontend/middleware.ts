import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Your authentication logic here
  const token = request.cookies.get("token")?.value;
  console.log(`Middleware: Token: ${token ?? "No token"}, Path: ${request.nextUrl.pathname}`);

  // For now, let's just allow all requests to proceed if not explicitly handled.
  // More complex auth logic would go here (e.g., redirecting unauthenticated users).
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude API routes that are proxied to the backend
    '/((?!api|static|_next|favicon.ico).*)', // This pattern matches all paths except /api, /static, /_next, and /favicon.ico
  ],
};
