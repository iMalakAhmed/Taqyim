import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  return new NextResponse(`Token in middleware: ${token ?? "No token"}`);
}

export const config = {
  matcher: ["/:path*"],
};
